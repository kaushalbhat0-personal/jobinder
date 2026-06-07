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
  findByUserId: async () => null,
  save: async (r) =>
    ({ _tag: 'success', value: r, isSuccess: () => true, isFailure: () => false }) as never,
  delete: async () => {},
  getAnalysis: async () => null,
  saveAnalysis: async (a) =>
    ({ _tag: 'success', value: a, isSuccess: () => true, isFailure: () => false }) as never,
});

const createMockDiscoveryRepository = (): DiscoveryRepository => ({
  getFeed: async () => null,
  saveFeed: async (f) =>
    ({ _tag: 'success', value: f, isSuccess: () => true, isFailure: () => false }) as never,
  getActiveSession: async () => null,
  saveSession: async (s) =>
    ({ _tag: 'success', value: s, isSuccess: () => true, isFailure: () => false }) as never,
});

const createMockProfileRepository = (): ProfileRepository => ({
  findById: async () => null,
  findByUserId: async () => null,
  save: async (p) =>
    ({ _tag: 'success', value: p, isSuccess: () => true, isFailure: () => false }) as never,
  delete: async () => {},
});

const createMockAuthRepository = (): AuthRepository => ({
  signInWithOAuth: async () => {},
  signInWithOtp: async () => {},
  signInWithPassword: async () => ({}) as never,
  signUp: async () => ({}) as never,
  resetPasswordForEmail: async () => {},
  updatePassword: async () => {},
  verifyOtp: async () => ({}) as never,
  signOut: async () => {},
  getSession: async () => null,
  getUser: async () => null,
  onAuthStateChange: () => () => {},
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
