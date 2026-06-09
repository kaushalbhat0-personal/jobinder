import type { NormalizedJobSourceData } from '../entities/normalized-job-source';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface JobSourceRepository {
  upsert(source: NormalizedJobSourceData): Promise<void>;
}

export class SupabaseJobSourceRepository implements JobSourceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async upsert(source: NormalizedJobSourceData): Promise<void> {
    const { error } = await this.supabase.from('normalized_job_sources').upsert(
      {
        source: source.source,
        success_rate: source.successRate,
        last_sync: source.lastSync?.toISOString() ?? null,
        avg_quality_score: source.avgQualityScore,
        error_rate: source.errorRate,
        total_runs: source.totalRuns,
      },
      { onConflict: 'source' },
    );

    if (error) throw error;
  }
}
