import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { ProfileRepository } from '../repositories/profile-repository';
import type { UserProfile } from '../entities/user-profile';
import { NotFoundError } from '@/shared/core/errors';

export class GetProfileUseCase {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async execute(userId: string): Promise<Result<UserProfile>> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) return failure(new NotFoundError('Profile not found'));
    return success(profile);
  }
}
