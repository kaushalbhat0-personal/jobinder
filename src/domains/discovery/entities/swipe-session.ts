import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type SwipeDirection = 'left' | 'right' | 'up' | 'save';
export type SwipeSessionStatus = 'active' | 'paused' | 'completed';

export interface SwipeAction {
  jobId: string;
  direction: SwipeDirection;
  score: number | null;
  timestamp: Date;
}

export interface SwipeSessionData {
  id: string;
  userId: string;
  status: SwipeSessionStatus;
  actions: SwipeAction[];
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

export class SwipeSession {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly status: SwipeSessionStatus,
    public readonly actions: SwipeAction[],
    public readonly startedAt: Date,
    public readonly completedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: SwipeSessionData): Result<SwipeSession> {
    if (!data.id) return failure(new ValidationError('Session id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    return success(
      new SwipeSession(
        data.id,
        data.userId,
        data.status,
        data.actions,
        data.startedAt,
        data.completedAt,
        data.createdAt,
      ),
    );
  }

  recordAction(jobId: string, direction: SwipeDirection, score: number | null): SwipeSession {
    const action: SwipeAction = { jobId, direction, score, timestamp: new Date() };
    return new SwipeSession(
      this.id,
      this.userId,
      this.status,
      [...this.actions, action],
      this.startedAt,
      this.completedAt,
      this.createdAt,
    );
  }

  complete(): SwipeSession {
    return new SwipeSession(
      this.id,
      this.userId,
      'completed',
      this.actions,
      this.startedAt,
      new Date(),
      this.createdAt,
    );
  }

  getLikeCount(): number {
    return this.actions.filter((a) => a.direction === 'right').length;
  }

  getPassCount(): number {
    return this.actions.filter((a) => a.direction === 'left').length;
  }

  getSaveCount(): number {
    return this.actions.filter((a) => a.direction === 'save').length;
  }

  getApplyCount(): number {
    return this.actions.filter((a) => a.direction === 'up').length;
  }

  undoLastAction(): SwipeSession {
    return new SwipeSession(
      this.id,
      this.userId,
      this.status,
      this.actions.slice(0, -1),
      this.startedAt,
      this.completedAt,
      this.createdAt,
    );
  }
}
