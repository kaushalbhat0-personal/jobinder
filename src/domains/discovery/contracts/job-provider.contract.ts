import type { Job } from '../entities/job';
import type { Result } from '@/shared/core/result';

export interface JobProviderContract {
  readonly name: string;
  fetchJobs(params?: Record<string, unknown>): Promise<Result<Job[]>>;
  searchJobs(query: string): Promise<Result<Job[]>>;
  getJobById(id: string): Promise<Result<Job | null>>;
}
