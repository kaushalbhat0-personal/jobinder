import type { Result } from '@/shared/core/result';
import type { ApplicationRepository } from '../repositories/application-repository';
import { Application } from '../entities/application';
import type { ApplicationData } from '../entities/application';

export class ApplyToJobUseCase {
  constructor(private readonly applicationRepo: ApplicationRepository) {}

  async execute(data: ApplicationData): Promise<Result<Application>> {
    const app = Application.create(data);
    if (app.isFailure()) return app;
    return this.applicationRepo.save(app.value);
  }
}
