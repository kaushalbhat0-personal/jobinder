import { track } from '@/shared/analytics/track';
import type { ApplicationStage } from '../entities/application';

export function trackApplicationCreated(
  userId: string,
  jobId: string,
  stage: ApplicationStage,
): void {
  track('application_created', { userId, jobId, stage });
}

export function trackApplicationStageChanged(
  userId: string,
  jobId: string,
  previousStage: ApplicationStage,
  newStage: ApplicationStage,
): void {
  track('application_stage_changed', { userId, jobId, previousStage, newStage });

  if (newStage === 'interview' || newStage === 'technical' || newStage === 'final') {
    track('interview_received', { userId, jobId, stage: newStage });
  }

  if (newStage === 'offer') {
    track('offer_received', { userId, jobId });
  }
}
