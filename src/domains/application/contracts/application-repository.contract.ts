import type { Application } from '../entities/application';

export interface ApplicationRepositoryContract {
  findById(id: string): Promise<Application | null>;
  findByUser(userId: string): Promise<Application[]>;
  findByJob(userId: string, jobId: string): Promise<Application | null>;
  save(application: Application): Promise<void>;
  delete(id: string): Promise<void>;
}
