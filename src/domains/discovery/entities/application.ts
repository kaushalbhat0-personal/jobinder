import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'interview'
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationData {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string | null;
  coverLetter: string | null;
  status: ApplicationStatus;
  notes: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Application {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly jobId: string,
    public readonly resumeId: string | null,
    public readonly coverLetter: string | null,
    public readonly status: ApplicationStatus,
    public readonly notes: string | null,
    public readonly submittedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: ApplicationData): Result<Application> {
    if (!data.id) return failure(new ValidationError('Application id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    if (!data.jobId) return failure(new ValidationError('Job id is required'));
    return success(
      new Application(
        data.id,
        data.userId,
        data.jobId,
        data.resumeId,
        data.coverLetter,
        data.status,
        data.notes,
        data.submittedAt,
        data.createdAt,
        data.updatedAt,
      ),
    );
  }

  submit(): Result<Application> {
    if (this.status !== 'draft')
      return failure(new ValidationError('Only draft applications can be submitted'));
    return success(
      new Application(
        this.id,
        this.userId,
        this.jobId,
        this.resumeId,
        this.coverLetter,
        'submitted',
        this.notes,
        new Date(),
        this.createdAt,
        new Date(),
      ),
    );
  }

  withdraw(): Application {
    return new Application(
      this.id,
      this.userId,
      this.jobId,
      this.resumeId,
      this.coverLetter,
      'withdrawn',
      this.notes,
      this.submittedAt,
      this.createdAt,
      new Date(),
    );
  }
}
