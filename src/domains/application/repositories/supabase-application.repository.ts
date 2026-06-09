import { Application } from '../entities/application';
import type { ApplicationRepositoryContract } from '../contracts/application-repository.contract';
import { createSupabaseBrowserClient } from '@/shared/lib/supabase/client';

export class SupabaseApplicationRepository implements ApplicationRepositoryContract {
  async findById(id: string): Promise<Application | null> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from('applications').select('*').eq('id', id).single();

      if (error || !data) return null;

      return Application.create({
        id: data.id,
        userId: data.user_id,
        jobId: data.job_id,
        company: data.company,
        role: data.role,
        stage: data.stage,
        appliedDate: new Date(data.applied_date),
        lastUpdated: new Date(data.last_updated),
      });
    } catch {
      return null;
    }
  }

  async findByUser(userId: string): Promise<Application[]> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error || !data) return [];

      return data.map((row) =>
        Application.create({
          id: row.id,
          userId: row.user_id,
          jobId: row.job_id,
          company: row.company,
          role: row.role,
          stage: row.stage,
          appliedDate: new Date(row.applied_date),
          lastUpdated: new Date(row.last_updated),
        }),
      );
    } catch {
      return [];
    }
  }

  async findByJob(userId: string, jobId: string): Promise<Application | null> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (error || !data) return null;

      return Application.create({
        id: data.id,
        userId: data.user_id,
        jobId: data.job_id,
        company: data.company,
        role: data.role,
        stage: data.stage,
        appliedDate: new Date(data.applied_date),
        lastUpdated: new Date(data.last_updated),
      });
    } catch {
      return null;
    }
  }

  async save(application: Application): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('applications').upsert(
      {
        id: application.id,
        user_id: application.userId,
        job_id: application.jobId,
        company: application.company,
        role: application.role,
        stage: application.stage,
        applied_date: application.appliedDate.toISOString(),
        last_updated: application.lastUpdated.toISOString(),
      },
      { onConflict: 'id' },
    );

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('applications').delete().eq('id', id);

    if (error) throw error;
  }
}
