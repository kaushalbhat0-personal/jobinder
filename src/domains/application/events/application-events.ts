import type { ApplicationStage } from '../entities/application';

export const ApplicationEventTypes = {
  Created: 'application:created',
  Updated: 'application:updated',
  InterviewReceived: 'application:interview-received',
  OfferReceived: 'application:offer-received',
} as const;

export interface ApplicationCreatedPayload {
  applicationId: string;
  userId: string;
  jobId: string;
  company: string;
  role: string;
  stage: ApplicationStage;
}

export interface ApplicationUpdatedPayload {
  applicationId: string;
  userId: string;
  jobId: string;
  previousStage: ApplicationStage;
  newStage: ApplicationStage;
}

export interface ApplicationInterviewReceivedPayload {
  applicationId: string;
  userId: string;
  jobId: string;
  company: string;
  role: string;
}

export interface ApplicationOfferReceivedPayload {
  applicationId: string;
  userId: string;
  jobId: string;
  company: string;
  role: string;
}

export type ApplicationEventPayloads = {
  [ApplicationEventTypes.Created]: ApplicationCreatedPayload;
  [ApplicationEventTypes.Updated]: ApplicationUpdatedPayload;
  [ApplicationEventTypes.InterviewReceived]: ApplicationInterviewReceivedPayload;
  [ApplicationEventTypes.OfferReceived]: ApplicationOfferReceivedPayload;
};
