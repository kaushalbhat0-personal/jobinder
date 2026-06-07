import type { ApplicationRepositoryContract } from '../contracts/application-repository.contract';
import type { ApplicationStage } from '../entities/application';
import { Application } from '../entities/application';
import { eventBus } from '@/shared/events/event-bus';
import { trackApplicationCreated } from '../services/application-analytics.service';

export interface CreateApplicationInput {
  id: string;
  userId: string;
  jobId: string;
  company: string;
  role: string;
  stage?: ApplicationStage;
}

export class CreateApplicationUseCase {
  constructor(private readonly repository: ApplicationRepositoryContract) {}

  async execute(input: CreateApplicationInput): Promise<Application> {
    const existing = await this.repository.findByJob(input.userId, input.jobId);
    if (existing) {
      return existing;
    }

    const now = new Date();
    const stage = input.stage ?? 'saved';

    const application = Application.create({
      id: input.id,
      userId: input.userId,
      jobId: input.jobId,
      company: input.company,
      role: input.role,
      stage,
      appliedDate: now,
      lastUpdated: now,
    });

    await this.repository.save(application);

    eventBus.emit('application:created', {
      applicationId: application.id,
      userId: application.userId,
      jobId: application.jobId,
      company: application.company,
      role: application.role,
      stage: application.stage,
    });

    trackApplicationCreated(application.userId, application.jobId, application.stage);

    return application;
  }
}
