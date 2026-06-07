import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import { JobSourceRegistry } from '../providers/job-source-registry';
import { deduplicateJobs } from './job-deduplication.service';
import { filterQualityJobs, scoreJob } from './job-quality.service';
import { normalizedJobToJob } from './normalized-job-converter';
import { NormalizedJobSource } from '../entities/normalized-job-source';
import { JobSyncRun } from '../entities/job-sync-run';
import type { NormalizedJob } from '../entities/normalized-job';
import type { Job } from '../entities/job';
import type { NormalizedJobSourceData } from '../entities/normalized-job-source';
import type { JobSyncRunData } from '../entities/job-sync-run';

export interface FeedPipelineResult {
  jobs: Job[];
  sources: string[];
  totalFetched: number;
  afterDedup: number;
  afterQuality: number;
  sourceHealth: NormalizedJobSourceData[];
  syncRuns: JobSyncRunData[];
}

export class FeedPipelineService {
  private readonly registry: JobSourceRegistry;
  private readonly sourceMetrics = new Map<string, NormalizedJobSource>();

  constructor(providers: NormalizedJobProvider[]) {
    this.registry = new JobSourceRegistry();
    for (const p of providers) {
      this.registry.registerProvider(p);
      this.sourceMetrics.set(p.name, NormalizedJobSource.create(p.name));
    }
  }

  getSourceHealth(): NormalizedJobSourceData[] {
    return Array.from(this.sourceMetrics.values()).map((s) => s.snapshot());
  }

  async execute(feedSeed?: string): Promise<FeedPipelineResult> {
    const providers = this.registry.getProviders();
    const allJobs: NormalizedJob[] = [];
    const syncRuns: JobSyncRun[] = [];

    for (const provider of providers) {
      const run = JobSyncRun.start(provider.name);
      syncRuns.push(run);

      let fetched: NormalizedJob[] = [];
      let success = true;

      try {
        fetched = await provider.fetchJobs();
      } catch {
        success = false;
      }

      run.complete(fetched.length, 0, 0);
      allJobs.push(...fetched);

      const avgQuality =
        fetched.length > 0
          ? Math.round(fetched.reduce((sum, j) => sum + scoreJob(j).total, 0) / fetched.length)
          : 0;

      const metric = this.sourceMetrics.get(provider.name);
      if (metric) {
        metric.recordSync(success, avgQuality);
      }
    }

    const totalFetched = allJobs.length;
    const sources = [...new Set(allJobs.map((j) => j.source))];

    const deduped = deduplicateJobs(allJobs);
    const afterDedup = deduped.length;

    const qualityFiltered = filterQualityJobs(deduped);
    const afterQuality = qualityFiltered.length;

    for (const run of syncRuns) {
      const providerJobs = qualityFiltered.filter((j) => j.sources.includes(run.provider));
      run.complete(run.jobsFetched, providerJobs.length, run.jobsFetched - providerJobs.length);
    }

    const jobs: Job[] = [];
    for (const nj of qualityFiltered) {
      const result = normalizedJobToJob(nj, feedSeed);
      if (result.isSuccess()) {
        jobs.push(result.value);
      }
    }

    return {
      jobs,
      sources,
      totalFetched,
      afterDedup,
      afterQuality,
      sourceHealth: this.getSourceHealth(),
      syncRuns: syncRuns.map((r) => r.snapshot()),
    };
  }
}
