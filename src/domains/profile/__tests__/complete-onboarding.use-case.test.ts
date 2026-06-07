import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompleteOnboardingUseCase } from '../use-cases/complete-onboarding.use-case';
import type { ProfileRepository } from '../repositories/profile-repository';
import { UserProfile } from '../entities/user-profile';
import { success, failure } from '@/shared/core/result';
import { useProfileStore } from '../stores/profile-store';

function createMockRepo(): ProfileRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
}

describe('CompleteOnboardingUseCase', () => {
  beforeEach(() => {
    useProfileStore.getState().reset();
  });

  it('creates a new profile when none exists', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.findByUserId).mockResolvedValue(null);
    vi.mocked(repo.save).mockImplementation(async (profile) => success(profile));

    const uc = new CompleteOnboardingUseCase(repo);
    const result = await uc.execute('user-1', {
      name: 'John',
      careerStage: 'experienced',
      targetRoles: ['Frontend Developer'],
      preferredLocations: ['Remote'],
      expectedSalaryMin: 500000,
      expectedSalaryMax: 1500000,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.userId).toBe('user-1');
      expect(result.value.careerStage).toBe('experienced');
      expect(result.value.targetRoles).toEqual(['Frontend Developer']);
    }
    expect(repo.save).toHaveBeenCalled();
  });

  it('updates an existing profile', async () => {
    const repo = createMockRepo();
    const existing = UserProfile.create({
      id: 'profile-1',
      userId: 'user-1',
      name: 'John',
      headline: null,
      bio: null,
      avatarUrl: null,
      location: null,
      skills: [],
      experience: 0,
      preferences: {},
      careerStage: null,
      targetRoles: [],
      preferredLocations: [],
      expectedSalaryMin: null,
      expectedSalaryMax: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).getOrThrow();

    vi.mocked(repo.findByUserId).mockResolvedValue(existing);
    vi.mocked(repo.save).mockImplementation(async (profile) => success(profile));

    const uc = new CompleteOnboardingUseCase(repo);
    const result = await uc.execute('user-1', {
      name: 'John',
      careerStage: 'fresher',
      targetRoles: ['Backend Developer'],
      preferredLocations: ['Mumbai'],
      expectedSalaryMin: null,
      expectedSalaryMax: null,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.careerStage).toBe('fresher');
      expect(result.value.targetRoles).toEqual(['Backend Developer']);
    }
  });

  it('fails with empty name', async () => {
    const repo = createMockRepo();
    const uc = new CompleteOnboardingUseCase(repo);
    const result = await uc.execute('user-1', {
      name: '',
      careerStage: 'experienced',
      targetRoles: ['Developer'],
      preferredLocations: ['Remote'],
      expectedSalaryMin: null,
      expectedSalaryMax: null,
    });
    expect(result.isFailure()).toBe(true);
  });

  it('fails with empty target roles', async () => {
    const repo = createMockRepo();
    const uc = new CompleteOnboardingUseCase(repo);
    const result = await uc.execute('user-1', {
      name: 'John',
      careerStage: 'experienced',
      targetRoles: [],
      preferredLocations: ['Remote'],
      expectedSalaryMin: null,
      expectedSalaryMax: null,
    });
    expect(result.isFailure()).toBe(true);
  });

  it('fails with empty preferred locations', async () => {
    const repo = createMockRepo();
    const uc = new CompleteOnboardingUseCase(repo);
    const result = await uc.execute('user-1', {
      name: 'John',
      careerStage: 'experienced',
      targetRoles: ['Developer'],
      preferredLocations: [],
      expectedSalaryMin: null,
      expectedSalaryMax: null,
    });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when min salary exceeds max', async () => {
    const repo = createMockRepo();
    const uc = new CompleteOnboardingUseCase(repo);
    const result = await uc.execute('user-1', {
      name: 'John',
      careerStage: 'experienced',
      targetRoles: ['Developer'],
      preferredLocations: ['Remote'],
      expectedSalaryMin: 2000000,
      expectedSalaryMax: 1000000,
    });
    expect(result.isFailure()).toBe(true);
  });

  it('handles save failure', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.findByUserId).mockResolvedValue(null);
    vi.mocked(repo.save).mockResolvedValue(failure(new Error('DB error')));

    const uc = new CompleteOnboardingUseCase(repo);
    const result = await uc.execute('user-1', {
      name: 'John',
      careerStage: 'experienced',
      targetRoles: ['Developer'],
      preferredLocations: ['Remote'],
      expectedSalaryMin: null,
      expectedSalaryMax: null,
    });
    expect(result.isFailure()).toBe(true);
  });
});
