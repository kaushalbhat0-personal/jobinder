import type { Result } from '@/shared/core/result';
import type { ProfileRepository } from '../repositories/profile-repository';
import type { UserProfile } from '../entities/user-profile';

export class UpdateProfileUseCase {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async execute(profile: UserProfile): Promise<Result<UserProfile>> {
    return this.profileRepo.save(profile);
  }
}
