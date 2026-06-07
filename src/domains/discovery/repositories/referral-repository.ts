import type { Referral } from '../entities/referral';
import type { Result } from '@/shared/core/result';

export interface ReferralRepository {
  findById(id: string): Promise<Referral | null>;
  findByUser(userId: string): Promise<Referral[]>;
  save(referral: Referral): Promise<Result<Referral>>;
}
