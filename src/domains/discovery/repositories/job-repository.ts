import type { Job } from '../entities/job';
import type { Result } from '@/shared/core/result';

export interface JobRepository {
  findById(id: string): Promise<Job | null>;
  findByIds(ids: string[]): Promise<Job[]>;
  findBySkill(skills: string[]): Promise<Job[]>;
  save(job: Job): Promise<Result<Job>>;
}
