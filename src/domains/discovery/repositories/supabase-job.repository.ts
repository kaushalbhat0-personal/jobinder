import { Job } from '../entities/job';
import { ValidationError } from '@/shared/core/errors';
import { success, failure } from '@/shared/core/result';
import type { Result } from '@/shared/core/result';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseJobRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Job | null> {
    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;

      return this.hydrateJob(data);
    } catch {
      return null;
    }
  }

  async findByIds(ids: string[]): Promise<Job[]> {
    try {
      const { data, error } = await this.supabase.from('jobs').select('*').in('id', ids);

      if (error || !data) return [];

      return data.map((row) => this.hydrateJob(row)).filter(Boolean) as Job[];
    } catch {
      return [];
    }
  }

  async findBySkill(skills: string[]): Promise<Job[]> {
    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .select('*')
        .overlaps('skills', skills)
        .eq('status', 'active');

      if (error || !data) return [];

      return data.map((row) => this.hydrateJob(row)).filter(Boolean) as Job[];
    } catch {
      return [];
    }
  }

  async save(job: Job): Promise<Result<Job>> {
    try {
      const { error } = await this.supabase.from('jobs').upsert(
        {
          id: job.id,
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          type: job.type,
          status: job.status,
          salary_min: job.salaryMin,
          salary_max: job.salaryMax,
          currency: job.currency,
          skills: job.skills,
          experience_required: job.experienceRequired,
          application_url: job.applicationUrl,
          posted_at: job.postedAt.toISOString(),
          expires_at: job.expiresAt?.toISOString() ?? null,
          created_at: job.createdAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (error) return failure(new ValidationError(`Failed to save job: ${error.message}`));

      return success(job);
    } catch (err) {
      return failure(new ValidationError(`Failed to save job: ${(err as Error).message}`));
    }
  }

  async upsertMany(jobs: Job[]): Promise<Result<Job[]>> {
    const now = new Date().toISOString();
    const rows = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      type: job.type,
      status: job.status,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      currency: job.currency,
      skills: job.skills,
      experience_required: job.experienceRequired,
      application_url: job.applicationUrl,
      posted_at: job.postedAt.toISOString(),
      expires_at: job.expiresAt?.toISOString() ?? null,
      created_at: job.createdAt.toISOString(),
      updated_at: now,
    }));

    try {
      const { error } = await this.supabase.from('jobs').upsert(rows, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

      if (error) return failure(new ValidationError(`Failed to upsert jobs: ${error.message}`));

      return success(jobs);
    } catch (err) {
      return failure(new ValidationError(`Failed to upsert jobs: ${(err as Error).message}`));
    }
  }

  async findActiveJobs(limit = 100): Promise<Job[]> {
    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .filter('expires_at', 'is', null)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map((row) => this.hydrateJob(row)).filter(Boolean) as Job[];
    } catch {
      return [];
    }
  }

  private hydrateJob(data: Record<string, unknown>): Job | null {
    const result = Job.create({
      id: data.id as string,
      title: data.title as string,
      company: data.company as string,
      description: (data.description as string) ?? '',
      location: (data.location as string) ?? null,
      type: (data.type as Job['type']) ?? 'full-time',
      status: (data.status as Job['status']) ?? 'active',
      salaryMin: (data.salary_min as number) ?? null,
      salaryMax: (data.salary_max as number) ?? null,
      currency: (data.currency as string) ?? 'USD',
      skills: (data.skills as string[]) ?? [],
      experienceRequired: (data.experience_required as number) ?? 0,
      applicationUrl: (data.application_url as string) ?? null,
      postedAt: new Date(data.posted_at as string),
      expiresAt: data.expires_at ? new Date(data.expires_at as string) : null,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    });

    return result.isSuccess() ? result.value : null;
  }
}
