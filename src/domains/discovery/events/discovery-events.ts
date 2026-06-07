import { eventBus } from '@/shared/events/event-bus';

export const DiscoveryEventTypes = {
  JobLiked: 'job:liked',
  JobDisliked: 'job:disliked',
  JobPassed: 'job:passed',
  JobSaved: 'job:saved',
  JobApplyIntent: 'job:apply-intent',
  ReferralRequested: 'referral:requested',
  FeedGenerated: 'discovery:feed-generated',
  FeedGenerationStarted: 'discovery:feed-generation-started',
  FeedRefreshRequested: 'discovery:feed-refresh-requested',
  ApplicationSubmitted: 'application:submitted',
} as const;

export interface JobLikedPayload {
  userId: string;
  jobId: string;
  score: number;
}
export interface JobDislikedPayload {
  userId: string;
  jobId: string;
}
export interface JobPassedPayload {
  userId: string;
  jobId: string;
}
export interface JobSavedPayload {
  userId: string;
  jobId: string;
  score: number;
}
export interface JobApplyIntentPayload {
  userId: string;
  jobId: string;
  score: number;
}
export interface ReferralRequestedPayload {
  userId: string;
  referralId: string;
  jobId: string;
}
export interface FeedGeneratedPayload {
  userId: string;
  feedId?: string;
  generationId?: string;
  jobCount?: number;
}
export interface FeedGenerationStartedPayload {
  userId: string;
  generationId: string;
}
export interface FeedRefreshRequestedPayload {
  userId: string;
  generationId: string;
}
export interface ApplicationSubmittedPayload {
  userId: string;
  jobId: string;
  applicationId: string;
}

export type DiscoveryEventPayloads = {
  [DiscoveryEventTypes.JobLiked]: JobLikedPayload;
  [DiscoveryEventTypes.JobDisliked]: JobDislikedPayload;
  [DiscoveryEventTypes.JobPassed]: JobPassedPayload;
  [DiscoveryEventTypes.JobSaved]: JobSavedPayload;
  [DiscoveryEventTypes.JobApplyIntent]: JobApplyIntentPayload;
  [DiscoveryEventTypes.ReferralRequested]: ReferralRequestedPayload;
  [DiscoveryEventTypes.FeedGenerated]: FeedGeneratedPayload;
  [DiscoveryEventTypes.FeedGenerationStarted]: FeedGenerationStartedPayload;
  [DiscoveryEventTypes.FeedRefreshRequested]: FeedRefreshRequestedPayload;
  [DiscoveryEventTypes.ApplicationSubmitted]: ApplicationSubmittedPayload;
};

export function emitDiscoveryEvent<K extends keyof DiscoveryEventPayloads & string>(
  type: K,
  payload: DiscoveryEventPayloads[K],
): void {
  eventBus.emit(type as never, payload as never);
}
