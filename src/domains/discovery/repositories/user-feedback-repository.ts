import type { UserFeedback } from '../entities/user-feedback';

export interface UserFeedbackRepository {
  save(feedback: UserFeedback): Promise<void>;
}
