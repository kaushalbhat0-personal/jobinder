import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import type { SupabaseJobRepository } from '../repositories/supabase-job.repository';
import type { SyncRunRepository } from '../repositories/supabase-sync-run.repository';
import type { JobSourceRepository } from '../repositories/supabase-job-source.repository';
import { FeedPipelineService } from '../services/feed-pipeline.service';

export interface SyncResult {
  totalFetched: number;
  totalPersisted: number;
  afterDedup: number;
  afterQuality: number;
  syncRuns: Array<{
    provider: string;
    jobsFetched: number;
    jobsAccepted: number;
    duration: number;
  }>;
  errors: string[];
}

export class JobSyncUseCase {
  constructor(
    private readonly providers: NormalizedJobProvider[],
    private readonly jobRepo: SupabaseJobRepository,
    private readonly syncRunRepo: SyncRunRepository,
    private readonly jobSourceRepo: JobSourceRepository,
  ) {}

  async execute(): Promise<SyncResult> {
    const errors: string[] = [];

    const pipeline = new FeedPipelineService(this.providers);
    const pipelineResult = await pipeline.execute();

    const jobs = pipelineResult.jobs;

    if (jobs.length > 0) {
      const persistResult = await this.jobRepo.upsertMany(jobs);
      if (persistResult.isFailure()) {
        errors.push(persistResult.error?.message ?? 'Failed to persist jobs');
      }
    }

    for (const run of pipelineResult.syncRuns) {
      try {
        await this.syncRunRepo.insert(run);
      } catch (err) {
        errors.push(`Failed to persist sync run for ${run.provider}: ${(err as Error).message}`);
      }
    }

    for (const health of pipelineResult.sourceHealth) {
      try {
        await this.jobSourceRepo.upsert(health);
      } catch (err) {
        errors.push(
          `Failed to persist source health for ${health.source}: ${(err as Error).message}`,
        );
      }
    }

    return {
      totalFetched: pipelineResult.totalFetched,
      totalPersisted: jobs.length,
      afterDedup: pipelineResult.afterDedup,
      afterQuality: pipelineResult.afterQuality,
      syncRuns: pipelineResult.syncRuns.map((r) => ({
        provider: r.provider,
        jobsFetched: r.jobsFetched,
        jobsAccepted: r.jobsAccepted,
        duration: r.duration,
      })),
      errors,
    };
  }
}
