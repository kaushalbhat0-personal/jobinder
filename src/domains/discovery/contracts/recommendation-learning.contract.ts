import type { Result } from '@/shared/core/result';
import type { UserFeedback } from '../entities/user-feedback';

export interface RecommendationLearningContract {
  recordFeedback(feedback: UserFeedback): Promise<Result<void>>;
  getUserPreferences(userId: string): Promise<Result<Record<string, number>>>;
  updateUserPreferences(userId: string, preferences: Record<string, number>): Promise<Result<void>>;
}
