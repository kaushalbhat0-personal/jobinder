import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/shared/lib/supabase/admin';
import { SupabaseJobRepository } from '@/domains/discovery/repositories/supabase-job.repository';
import { SupabaseSyncRunRepository } from '@/domains/discovery/repositories/supabase-sync-run.repository';
import { SupabaseJobSourceRepository } from '@/domains/discovery/repositories/supabase-job-source.repository';
import { JobSyncUseCase } from '@/domains/discovery/use-cases/job-sync.use-case';
import { RemoteOkProvider } from '@/domains/discovery/providers/remoteok-provider';
import { RemotiveProvider } from '@/domains/discovery/providers/remotive-provider';
import { WellfoundProvider } from '@/domains/discovery/providers/wellfound-provider';

export async function POST() {
  try {
    const supabase = createSupabaseAdminClient();

    const jobRepo = new SupabaseJobRepository(supabase);
    const syncRunRepo = new SupabaseSyncRunRepository(supabase);
    const jobSourceRepo = new SupabaseJobSourceRepository(supabase);

    const providers = [new RemoteOkProvider(), new RemotiveProvider(), new WellfoundProvider()];

    const useCase = new JobSyncUseCase(providers, jobRepo, syncRunRepo, jobSourceRepo);
    const result = await useCase.execute();

    return NextResponse.json({
      success: result.errors.length === 0,
      totalFetched: result.totalFetched,
      totalPersisted: result.totalPersisted,
      afterDedup: result.afterDedup,
      afterQuality: result.afterQuality,
      syncRuns: result.syncRuns,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
