import type { ResumeRepository } from '@/domains/resume/repositories/resume-repository';
import type { DiscoveryRepository } from '@/domains/discovery/repositories/discovery-repository';
import type { ProfileRepository } from '@/domains/profile/repositories/profile-repository';
import type { AuthRepository } from '@/domains/auth/repositories/auth-repository';

let resumeRepo: ResumeRepository | null = null;
let discoveryRepo: DiscoveryRepository | null = null;
let profileRepo: ProfileRepository | null = null;
let authRepo: AuthRepository | null = null;

export function setResumeRepository(repository: ResumeRepository): void {
  resumeRepo = repository;
}

export function getResumeRepository(): ResumeRepository {
  if (!resumeRepo) {
    throw new Error('ResumeRepository not initialized. Call setResumeRepository first.');
  }
  return resumeRepo;
}

export function setDiscoveryRepository(repository: DiscoveryRepository): void {
  discoveryRepo = repository;
}

export function getDiscoveryRepository(): DiscoveryRepository {
  if (!discoveryRepo) {
    throw new Error('DiscoveryRepository not initialized. Call setDiscoveryRepository first.');
  }
  return discoveryRepo;
}

export function setProfileRepository(repository: ProfileRepository): void {
  profileRepo = repository;
}

export function getProfileRepository(): ProfileRepository {
  if (!profileRepo) {
    throw new Error('ProfileRepository not initialized. Call setProfileRepository first.');
  }
  return profileRepo;
}

export function setAuthRepository(repository: AuthRepository): void {
  authRepo = repository;
}

export function getAuthRepository(): AuthRepository {
  if (!authRepo) {
    throw new Error('AuthRepository not initialized. Call setAuthRepository first.');
  }
  return authRepo;
}

export function resetRepositories(): void {
  resumeRepo = null;
  discoveryRepo = null;
  profileRepo = null;
  authRepo = null;
}
