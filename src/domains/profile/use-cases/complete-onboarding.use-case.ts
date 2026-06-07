import type { Result } from '@/shared/core/result';
import { failure } from '@/shared/core/result';
import type { ProfileRepository } from '../repositories/profile-repository';
import { UserProfile } from '../entities/user-profile';
import type { CareerStage } from '../entities/user-profile';
import { ValidationError } from '@/shared/core/errors';
import { emitProfileEvent, ProfileEventTypes } from '../events/profile-events';
import { useProfileStore } from '../stores/profile-store';
import { track } from '@/shared/analytics/track';

export class CompleteOnboardingUseCase {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async execute(
    userId: string,
    data: {
      name: string;
      careerStage: CareerStage;
      targetRoles: string[];
      preferredLocations: string[];
      expectedSalaryMin: number | null;
      expectedSalaryMax: number | null;
    },
  ): Promise<Result<UserProfile>> {
    if (!data.name || data.name.trim().length === 0)
      return failure(new ValidationError('Name is required'));
    if (!data.careerStage) return failure(new ValidationError('Career stage is required'));
    if (data.targetRoles.length === 0)
      return failure(new ValidationError('At least one target role is required'));
    if (data.preferredLocations.length === 0)
      return failure(new ValidationError('At least one preferred location is required'));
    if (
      data.expectedSalaryMin != null &&
      data.expectedSalaryMax != null &&
      data.expectedSalaryMin > data.expectedSalaryMax
    ) {
      return failure(new ValidationError('Minimum salary cannot exceed maximum salary'));
    }

    const existing = await this.profileRepo.findByUserId(userId);
    let profile: UserProfile;

    if (existing) {
      const result = existing.completeOnboarding(
        data.careerStage,
        data.targetRoles,
        data.preferredLocations,
        data.expectedSalaryMin,
        data.expectedSalaryMax,
      );
      if (result.isFailure()) return result;
      profile = result.value;
    } else {
      const createResult = UserProfile.create({
        id: crypto.randomUUID(),
        userId,
        name: data.name.trim(),
        headline: null,
        bio: null,
        avatarUrl: null,
        location: null,
        skills: [],
        experience: 0,
        preferences: {},
        careerStage: data.careerStage,
        targetRoles: data.targetRoles,
        preferredLocations: data.preferredLocations,
        expectedSalaryMin: data.expectedSalaryMin,
        expectedSalaryMax: data.expectedSalaryMax,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      if (createResult.isFailure()) return createResult;
      profile = createResult.value;
    }

    const saved = await this.profileRepo.save(profile);
    if (saved.isFailure()) return saved;

    emitProfileEvent(ProfileEventTypes.ProfileUpdated, {
      userId,
      updatedFields: [
        'careerStage',
        'targetRoles',
        'preferredLocations',
        'expectedSalaryMin',
        'expectedSalaryMax',
      ],
    });
    track('profile_updated', { userId, onboarding: 'completed' });

    useProfileStore.getState().setProfile(saved.value);

    return saved;
  }
}
