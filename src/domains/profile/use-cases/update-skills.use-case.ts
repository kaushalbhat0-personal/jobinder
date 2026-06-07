import type { Result } from '@/shared/core/result';
import { failure } from '@/shared/core/result';
import type { ProfileRepository } from '../repositories/profile-repository';
import type { UserProfile } from '../entities/user-profile';
import { NotFoundError } from '@/shared/core/errors';

export class UpdateSkillsUseCase {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async execute(userId: string, skills: string[]): Promise<Result<UserProfile>> {
    const existing = await this.profileRepo.findByUserId(userId);
    if (!existing) return failure(new NotFoundError('Profile not found'));
    const updated = existing.updateSkills(skills);
    if (updated.isFailure()) return updated;
    return this.profileRepo.save(updated.value);
  }
}
