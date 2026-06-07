export type FeedbackAction = 'like' | 'pass' | 'save' | 'apply';

export interface UserFeedbackData {
  userId: string;
  jobId: string;
  action: FeedbackAction;
  createdAt: Date;
}

export class UserFeedback {
  constructor(
    public readonly userId: string,
    public readonly jobId: string,
    public readonly action: FeedbackAction,
    public readonly createdAt: Date,
  ) {}
}
