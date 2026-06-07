import type { CareerStage } from '../entities/user-profile';
export type { UserProfileData } from '../entities/user-profile';
export type ProfileUpdateInput = {
  name?: string;
  headline?: string;
  bio?: string;
  location?: string;
};
export type SkillsInput = { skills: string[] };
export type PreferencesInput = { preferences: Record<string, unknown> };
export type OnboardingInput = {
  careerStage: CareerStage;
  targetRoles: string[];
  preferredLocations: string[];
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
};
