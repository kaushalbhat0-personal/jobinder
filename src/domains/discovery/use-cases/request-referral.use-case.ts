import type { Result } from '@/shared/core/result';
import type { ReferralRepository } from '../repositories/referral-repository';
import { Referral } from '../entities/referral';
import type { ReferralData } from '../entities/referral';

export class RequestReferralUseCase {
  constructor(private readonly referralRepo: ReferralRepository) {}

  async execute(data: ReferralData): Promise<Result<Referral>> {
    const referral = Referral.create(data);
    if (referral.isFailure()) return referral;
    return this.referralRepo.save(referral.value);
  }
}
