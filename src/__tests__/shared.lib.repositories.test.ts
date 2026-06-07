import { describe, it, expect, beforeEach } from 'vitest';
import {
  getResumeRepository,
  getDiscoveryRepository,
  getProfileRepository,
  getAuthRepository,
  setResumeRepository,
  setDiscoveryRepository,
  setProfileRepository,
  setAuthRepository,
  resetRepositories,
} from '@/shared/lib/repositories/repository-factory';
import type { ResumeRepository } from '@/domains/resume/repositories/resume-repository';
import type { DiscoveryRepository } from '@/domains/discovery/repositories/discovery-repository';
import type { ProfileRepository } from '@/domains/profile/repositories/profile-repository';
import type { AuthRepository } from '@/domains/auth/repositories/auth-repository';

const createMockResumeRepository = (): ResumeRepository => ({
  findById: async () => null,
  save: async () => {},
  delete: async () => {},
});

const createMockDiscoveryRepository = (): DiscoveryRepository => ({
  getFeed: async () => [],
  swipe: async () => {},
});

const createMockProfileRepository = (): ProfileRepository => ({
  findById: async () => null,
  save: async () => {},
});

const createMockAuthRepository = (): AuthRepository => ({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  getSession: async () => null,
});

describe('Repository Factory', () => {
  beforeEach(() => {
    resetRepositories();
  });

  it('throws when getting uninitialized repositories', () => {
    expect(() => getResumeRepository()).toThrow('not initialized');
    expect(() => getDiscoveryRepository()).toThrow('not initialized');
    expect(() => getProfileRepository()).toThrow('not initialized');
    expect(() => getAuthRepository()).toThrow('not initialized');
  });

  it('returns the set repository instance', () => {
    const mock = createMockResumeRepository();
    setResumeRepository(mock);
    expect(getResumeRepository()).toBe(mock);
  });

  it('returns different repositories independently', () => {
    const resumeMock = createMockResumeRepository();
    const discoveryMock = createMockDiscoveryRepository();

    setResumeRepository(resumeMock);
    setDiscoveryRepository(discoveryMock);

    expect(getResumeRepository()).toBe(resumeMock);
    expect(getDiscoveryRepository()).toBe(discoveryMock);
  });

  it('supports all repository types', () => {
    const resumeMock = createMockResumeRepository();
    const discoveryMock = createMockDiscoveryRepository();
    const profileMock = createMockProfileRepository();
    const authMock = createMockAuthRepository();

    setResumeRepository(resumeMock);
    setDiscoveryRepository(discoveryMock);
    setProfileRepository(profileMock);
    setAuthRepository(authMock);

    expect(getResumeRepository()).toBe(resumeMock);
    expect(getDiscoveryRepository()).toBe(discoveryMock);
    expect(getProfileRepository()).toBe(profileMock);
    expect(getAuthRepository()).toBe(authMock);
  });

  it('resetRepositories clears all', () => {
    const mock = createMockResumeRepository();
    setResumeRepository(mock);
    resetRepositories();
    expect(() => getResumeRepository()).toThrow('not initialized');
  });
});
