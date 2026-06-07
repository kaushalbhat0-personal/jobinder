import { UserFeedback, type FeedbackAction } from '../entities/user-feedback';
import type { SwipeDirection } from '../entities/swipe-session';
import { eventBus } from '@/shared/events/event-bus';
import { track, type AnalyticsEvent } from '@/shared/analytics/track';

function directionToAction(direction: SwipeDirection, _score: number | null): FeedbackAction {
  switch (direction) {
    case 'right':
      return 'like';
    case 'left':
      return 'pass';
    case 'up':
      return 'apply';
    case 'save':
      return 'save';
  }
}

const actionToAnalyticsMap: Record<FeedbackAction, AnalyticsEvent> = {
  like: 'job_liked',
  pass: 'job_passed',
  save: 'job_saved',
  apply: 'job_apply_intent',
};

function emitEvent(
  userId: string,
  jobId: string,
  direction: SwipeDirection,
  score: number | null,
): void {
  switch (direction) {
    case 'right':
      eventBus.emit('job:liked', { userId, jobId, score: score ?? 0 });
      break;
    case 'left':
      eventBus.emit('job:passed', { userId, jobId });
      break;
    case 'save':
      eventBus.emit('job:saved', { userId, jobId, score: score ?? 0 });
      break;
    case 'up':
      eventBus.emit('job:apply-intent', { userId, jobId, score: score ?? 0 });
      break;
  }
}

export function recordSwipeFeedback(
  userId: string,
  jobId: string,
  direction: SwipeDirection,
  score: number | null,
): UserFeedback {
  const action = directionToAction(direction, score);
  const feedback = new UserFeedback(userId, jobId, action, new Date());

  emitEvent(userId, jobId, direction, score);
  track(actionToAnalyticsMap[action], { userId, jobId, score: score ?? 0 });

  return feedback;
}
