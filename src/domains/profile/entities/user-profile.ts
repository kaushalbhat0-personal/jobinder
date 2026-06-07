import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type CareerStage = 'student' | 'fresher' | 'experienced';

export interface UserProfileData {
  id: string;
  userId: string;
  name: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  skills: string[];
  experience: number;
  preferences: Record<string, unknown>;
  careerStage: CareerStage | null;
  targetRoles: string[];
  preferredLocations: string[];
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly headline: string | null,
    public readonly bio: string | null,
    public readonly avatarUrl: string | null,
    public readonly location: string | null,
    public readonly skills: string[],
    public readonly experience: number,
    public readonly preferences: Record<string, unknown>,
    public readonly careerStage: CareerStage | null,
    public readonly targetRoles: string[],
    public readonly preferredLocations: string[],
    public readonly expectedSalaryMin: number | null,
    public readonly expectedSalaryMax: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: UserProfileData): Result<UserProfile> {
    if (!data.id) return failure(new ValidationError('Profile id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    if (!data.name || data.name.trim().length === 0)
      return failure(new ValidationError('Name cannot be empty'));
    return success(
      new UserProfile(
        data.id,
        data.userId,
        data.name.trim(),
        data.headline,
        data.bio,
        data.avatarUrl,
        data.location,
        data.skills,
        data.experience,
        data.preferences,
        data.careerStage ?? null,
        data.targetRoles ?? [],
        data.preferredLocations ?? [],
        data.expectedSalaryMin ?? null,
        data.expectedSalaryMax ?? null,
        data.createdAt,
        data.updatedAt,
      ),
    );
  }

  updateSkills(skills: string[]): Result<UserProfile> {
    if (skills.length === 0) return failure(new ValidationError('At least one skill is required'));
    return success(this.with({ skills, updatedAt: new Date() }));
  }

  updatePreferences(preferences: Record<string, unknown>): UserProfile {
    return this.with({ preferences, updatedAt: new Date() });
  }

  completeOnboarding(
    careerStage: CareerStage,
    targetRoles: string[],
    preferredLocations: string[],
    expectedSalaryMin: number | null,
    expectedSalaryMax: number | null,
  ): Result<UserProfile> {
    if (!careerStage) return failure(new ValidationError('Career stage is required'));
    if (targetRoles.length === 0)
      return failure(new ValidationError('At least one target role is required'));
    if (preferredLocations.length === 0)
      return failure(new ValidationError('At least one preferred location is required'));
    if (
      expectedSalaryMin != null &&
      expectedSalaryMax != null &&
      expectedSalaryMin > expectedSalaryMax
    ) {
      return failure(new ValidationError('Minimum salary cannot exceed maximum salary'));
    }
    return success(
      this.with({
        careerStage,
        targetRoles,
        preferredLocations,
        expectedSalaryMin,
        expectedSalaryMax,
        updatedAt: new Date(),
      }),
    );
  }

  private with(overrides: Partial<UserProfileData>): UserProfile {
    return new UserProfile(
      overrides.id ?? this.id,
      overrides.userId ?? this.userId,
      overrides.name ?? this.name,
      overrides.headline ?? this.headline,
      overrides.bio ?? this.bio,
      overrides.avatarUrl ?? this.avatarUrl,
      overrides.location ?? this.location,
      overrides.skills ?? this.skills,
      overrides.experience ?? this.experience,
      overrides.preferences ?? this.preferences,
      overrides.careerStage ?? this.careerStage,
      overrides.targetRoles ?? this.targetRoles,
      overrides.preferredLocations ?? this.preferredLocations,
      overrides.expectedSalaryMin ?? this.expectedSalaryMin,
      overrides.expectedSalaryMax ?? this.expectedSalaryMax,
      overrides.createdAt ?? this.createdAt,
      overrides.updatedAt ?? this.updatedAt,
    );
  }
}
