import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type ReferralStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'cancelled';

export interface ReferralData {
  id: string;
  userId: string;
  jobId: string;
  referrerName: string;
  referrerEmail: string;
  message: string;
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Referral {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly jobId: string,
    public readonly referrerName: string,
    public readonly referrerEmail: string,
    public readonly message: string,
    public readonly status: ReferralStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: ReferralData): Result<Referral> {
    if (!data.id) return failure(new ValidationError('Referral id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    if (!data.jobId) return failure(new ValidationError('Job id is required'));
    if (!data.referrerEmail || !data.referrerEmail.includes('@'))
      return failure(new ValidationError('Valid referrer email is required'));
    return success(
      new Referral(
        data.id,
        data.userId,
        data.jobId,
        data.referrerName,
        data.referrerEmail,
        data.message,
        data.status,
        data.createdAt,
        data.updatedAt,
      ),
    );
  }

  accept(): Referral {
    return new Referral(
      this.id,
      this.userId,
      this.jobId,
      this.referrerName,
      this.referrerEmail,
      this.message,
      'accepted',
      this.createdAt,
      new Date(),
    );
  }

  reject(): Referral {
    return new Referral(
      this.id,
      this.userId,
      this.jobId,
      this.referrerName,
      this.referrerEmail,
      this.message,
      'rejected',
      this.createdAt,
      new Date(),
    );
  }
}
