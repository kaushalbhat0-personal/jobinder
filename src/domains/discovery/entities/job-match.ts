import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export interface JobMatchData {
  id: string;
  jobId: string;
  userId: string;
  score: number;
  reasons: string[];
  strengths: string[];
  gaps: string[];
  createdAt: Date;
}

export class JobMatch {
  private constructor(
    public readonly id: string,
    public readonly jobId: string,
    public readonly userId: string,
    public readonly score: number,
    public readonly reasons: string[],
    public readonly strengths: string[],
    public readonly gaps: string[],
    public readonly createdAt: Date,
  ) {}

  static create(data: JobMatchData): Result<JobMatch> {
    if (!data.id) return failure(new ValidationError('JobMatch id is required'));
    if (!data.jobId) return failure(new ValidationError('Job id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    if (data.score < 0 || data.score > 100)
      return failure(new ValidationError('Score must be between 0 and 100'));
    return success(
      new JobMatch(
        data.id,
        data.jobId,
        data.userId,
        data.score,
        data.reasons,
        data.strengths,
        data.gaps,
        data.createdAt,
      ),
    );
  }
}
