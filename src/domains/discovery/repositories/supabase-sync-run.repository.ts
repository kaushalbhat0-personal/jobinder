import type { JobSyncRunData } from '../entities/job-sync-run';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SyncRunRepository {
  insert(run: JobSyncRunData): Promise<void>;
}

export class SupabaseSyncRunRepository implements SyncRunRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async insert(run: JobSyncRunData): Promise<void> {
    const { error } = await this.supabase.from('job_sync_runs').insert({
      run_id: run.runId,
      provider: run.provider,
      jobs_fetched: run.jobsFetched,
      jobs_accepted: run.jobsAccepted,
      jobs_rejected: run.jobsRejected,
      duration: run.duration,
      started_at: run.startedAt.toISOString(),
      completed_at: run.completedAt?.toISOString() ?? null,
    });

    if (error) throw error;
  }
}
