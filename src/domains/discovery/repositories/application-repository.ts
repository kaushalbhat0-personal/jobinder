import type { Application } from '../entities/application';
import type { Result } from '@/shared/core/result';

export interface ApplicationRepository {
  findById(id: string): Promise<Application | null>;
  findByUser(userId: string): Promise<Application[]>;
  findByJob(jobId: string): Promise<Application[]>;
  save(application: Application): Promise<Result<Application>>;
}
