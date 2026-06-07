import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft';

export interface JobData {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  type: JobType;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  skills: string[];
  experienceRequired: number;
  applicationUrl: string | null;
  postedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Job {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly company: string,
    public readonly description: string,
    public readonly location: string | null,
    public readonly type: JobType,
    public readonly status: JobStatus,
    public readonly salaryMin: number | null,
    public readonly salaryMax: number | null,
    public readonly currency: string,
    public readonly skills: string[],
    public readonly experienceRequired: number,
    public readonly applicationUrl: string | null,
    public readonly postedAt: Date,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: JobData): Result<Job> {
    if (!data.id) return failure(new ValidationError('Job id is required'));
    if (!data.title || data.title.trim().length === 0)
      return failure(new ValidationError('Title is required'));
    if (!data.company || data.company.trim().length === 0)
      return failure(new ValidationError('Company is required'));
    if (data.experienceRequired < 0)
      return failure(new ValidationError('Experience required cannot be negative'));
    return success(
      new Job(
        data.id,
        data.title,
        data.company,
        data.description,
        data.location,
        data.type,
        data.status,
        data.salaryMin,
        data.salaryMax,
        data.currency,
        data.skills,
        data.experienceRequired,
        data.applicationUrl,
        data.postedAt,
        data.expiresAt,
        data.createdAt,
        data.updatedAt,
      ),
    );
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
  }

  isActive(): boolean {
    return this.status === 'active' && !this.isExpired();
  }
}
