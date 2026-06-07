import type { Application } from '../entities/application';
import type { ApplicationRepositoryContract } from '../contracts/application-repository.contract';

export class InMemoryApplicationRepository implements ApplicationRepositoryContract {
  private applications = new Map<string, Application>();

  async findById(id: string): Promise<Application | null> {
    return this.applications.get(id) ?? null;
  }

  async findByUser(userId: string): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  async findByJob(userId: string, jobId: string): Promise<Application | null> {
    return (
      Array.from(this.applications.values()).find(
        (a) => a.userId === userId && a.jobId === jobId,
      ) ?? null
    );
  }

  async save(application: Application): Promise<void> {
    this.applications.set(application.id, application);
  }

  async delete(id: string): Promise<void> {
    this.applications.delete(id);
  }

  clear(): void {
    this.applications.clear();
  }
}
