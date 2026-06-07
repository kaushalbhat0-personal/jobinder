import type { ApplicationRepositoryContract } from '../contracts/application-repository.contract';
import type { Application } from '../entities/application';

export class GetUserApplicationsUseCase {
  constructor(private readonly repository: ApplicationRepositoryContract) {}

  async execute(userId: string): Promise<Application[]> {
    return this.repository.findByUser(userId);
  }
}
