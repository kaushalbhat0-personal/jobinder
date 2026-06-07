import { describe, it, expect } from 'vitest';
import { UserProfile, type CareerStage } from '../entities/user-profile';

const validData = {
  id: 'profile-1',
  userId: 'user-1',
  name: 'John Doe',
  headline: 'Software Engineer',
  bio: 'Building great software',
  avatarUrl: null,
  location: 'Remote',
  skills: ['TypeScript', 'React'],
  experience: 5,
  preferences: { theme: 'dark' },
  careerStage: null,
  targetRoles: [] as string[],
  preferredLocations: [] as string[],
  expectedSalaryMin: null,
  expectedSalaryMax: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('UserProfile entity', () => {
  it('creates with valid data', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.name).toBe('John Doe');
      expect(result.value.skills).toEqual(['TypeScript', 'React']);
      expect(result.value.careerStage).toBeNull();
      expect(result.value.targetRoles).toEqual([]);
    }
  });

  it('fails when id is empty', () => {
    const result = UserProfile.create({ ...validData, id: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when userId is empty', () => {
    const result = UserProfile.create({ ...validData, userId: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when name is empty', () => {
    const result = UserProfile.create({ ...validData, name: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('updates skills', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const updated = result.value.updateSkills(['Go', 'Rust']);
      expect(updated.isSuccess()).toBe(true);
      if (updated.isSuccess()) {
        expect(updated.value.skills).toEqual(['Go', 'Rust']);
      }
    }
  });

  it('fails skills update with empty array', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const updated = result.value.updateSkills([]);
      expect(updated.isFailure()).toBe(true);
    }
  });

  it('updates preferences', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const updated = result.value.updatePreferences({ theme: 'light' });
      expect(updated.preferences).toEqual({ theme: 'light' });
    }
  });
});

describe('UserProfile onboarding', () => {
  it('completes onboarding with valid data', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const onboarded = result.value.completeOnboarding(
        'experienced',
        ['Frontend Developer'],
        ['Remote'],
        500000,
        1500000,
      );
      expect(onboarded.isSuccess()).toBe(true);
      if (onboarded.isSuccess()) {
        expect(onboarded.value.careerStage).toBe('experienced');
        expect(onboarded.value.targetRoles).toEqual(['Frontend Developer']);
        expect(onboarded.value.preferredLocations).toEqual(['Remote']);
        expect(onboarded.value.expectedSalaryMin).toBe(500000);
        expect(onboarded.value.expectedSalaryMax).toBe(1500000);
      }
    }
  });

  it('fails onboarding with null career stage', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const onboarded = result.value.completeOnboarding(
        null as unknown as CareerStage,
        ['Developer'],
        ['Remote'],
        null,
        null,
      );
      expect(onboarded.isFailure()).toBe(true);
    }
  });

  it('fails onboarding with empty target roles', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const onboarded = result.value.completeOnboarding('fresher', [], ['Remote'], null, null);
      expect(onboarded.isFailure()).toBe(true);
    }
  });

  it('fails onboarding with empty preferred locations', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const onboarded = result.value.completeOnboarding('fresher', ['Developer'], [], null, null);
      expect(onboarded.isFailure()).toBe(true);
    }
  });

  it('fails onboarding when min salary exceeds max', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const onboarded = result.value.completeOnboarding(
        'experienced',
        ['Developer'],
        ['Remote'],
        2000000,
        1000000,
      );
      expect(onboarded.isFailure()).toBe(true);
    }
  });

  it('accepts onboarding with null salary range', () => {
    const result = UserProfile.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const onboarded = result.value.completeOnboarding(
        'student',
        ['Developer'],
        ['Remote'],
        null,
        null,
      );
      expect(onboarded.isSuccess()).toBe(true);
      if (onboarded.isSuccess()) {
        expect(onboarded.value.expectedSalaryMin).toBeNull();
        expect(onboarded.value.expectedSalaryMax).toBeNull();
      }
    }
  });
});
