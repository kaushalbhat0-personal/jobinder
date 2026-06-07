import type { ApplicationRepositoryContract } from '../contracts/application-repository.contract';
import type { Application, ApplicationStage } from '../entities/application';
import { eventBus } from '@/shared/events/event-bus';
import { trackApplicationStageChanged } from '../services/application-analytics.service';

export class UpdateApplicationStageUseCase {
  constructor(private readonly repository: ApplicationRepositoryContract) {}

  async execute(applicationId: string, newStage: ApplicationStage): Promise<Application> {
    const application = await this.repository.findById(applicationId);
    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const previousStage = application.stage;
    const updated = application.transitionTo(newStage);

    await this.repository.save(updated);

    eventBus.emit('application:updated', {
      applicationId: updated.id,
      userId: updated.userId,
      jobId: updated.jobId,
      previousStage,
      newStage,
    });

    if (newStage === 'interview' || newStage === 'technical' || newStage === 'final') {
      eventBus.emit('application:interview-received', {
        applicationId: updated.id,
        userId: updated.userId,
        jobId: updated.jobId,
        company: updated.company,
        role: updated.role,
      });
    }

    if (newStage === 'offer') {
      eventBus.emit('application:offer-received', {
        applicationId: updated.id,
        userId: updated.userId,
        jobId: updated.jobId,
        company: updated.company,
        role: updated.role,
      });
    }

    trackApplicationStageChanged(updated.userId, updated.jobId, previousStage, newStage);

    return updated;
  }
}
