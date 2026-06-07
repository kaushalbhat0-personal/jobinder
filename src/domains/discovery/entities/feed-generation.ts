import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type FeedGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type FeedSource = 'manual' | 'auto' | 'refresh';

export interface FeedGenerationData {
  id: string;
  userId: string;
  jobCount: number;
  source: FeedSource;
  status: FeedGenerationStatus;
  createdAt: Date;
  completedAt: Date | null;
  error: string | null;
}

export class FeedGeneration {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly jobCount: number,
    public readonly source: FeedSource,
    public readonly status: FeedGenerationStatus,
    public readonly createdAt: Date,
    public readonly completedAt: Date | null,
    public readonly error: string | null,
  ) {}

  static create(data: FeedGenerationData): Result<FeedGeneration> {
    if (!data.id) return failure(new ValidationError('Generation id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    if (data.jobCount < 0) return failure(new ValidationError('Job count cannot be negative'));
    return success(
      new FeedGeneration(
        data.id,
        data.userId,
        data.jobCount,
        data.source,
        data.status,
        data.createdAt,
        data.completedAt,
        data.error,
      ),
    );
  }

  complete(jobCount: number): FeedGeneration {
    return new FeedGeneration(
      this.id,
      this.userId,
      jobCount,
      this.source,
      'completed',
      this.createdAt,
      new Date(),
      null,
    );
  }

  fail(error: string): FeedGeneration {
    return new FeedGeneration(
      this.id,
      this.userId,
      this.jobCount,
      this.source,
      'failed',
      this.createdAt,
      new Date(),
      error,
    );
  }
}
