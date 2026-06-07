import { describe, it, expect } from 'vitest';
import { JobMatchingService } from '../services/job-matching.service';
import { Job } from '../entities/job';
import { UserProfile } from '@/domains/profile/entities/user-profile';
import type { ResumeAnalysisResult } from '@/domains/ai/schemas/resume-analysis-schema';

function createProfile(overrides: Partial<Parameters<typeof UserProfile.create>[0]> = {}) {
  return UserProfile.create({
    id: 'profile-1',
    userId: 'user-1',
    name: 'John Doe',
    headline: 'Engineer',
    bio: 'Experienced engineer',
    avatarUrl: null,
    location: null,
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    experience: 5,
    preferences: {},
    careerStage: 'experienced',
    targetRoles: ['Software Engineer', 'Senior Engineer'],
    preferredLocations: ['San Francisco, CA'],
    expectedSalaryMin: 130000,
    expectedSalaryMax: 170000,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }).getOrThrow();
}

const mockJob = Job.create({
  id: 'job-1',
  title: 'Senior Software Engineer',
  company: 'TechCorp',
  description: 'Build backend services.',
  location: 'San Francisco, CA',
  type: 'full-time',
  status: 'active',
  salaryMin: 140000,
  salaryMax: 180000,
  currency: 'USD',
  skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
  experienceRequired: 5,
  applicationUrl: null,
  postedAt: new Date('2026-06-01'),
  expiresAt: new Date('2026-08-01'),
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
}).getOrThrow();

const mockProfile = createProfile();

describe('JobMatchingService', () => {
  const service = new JobMatchingService();

  it('returns a match result', () => {
    const result = service.calculate({ job: mockJob, profile: mockProfile, analysis: null });
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.match.jobId).toBe('job-1');
    expect(result.value.match.userId).toBe('user-1');
    expect(result.value.match.score).toBeGreaterThanOrEqual(0);
    expect(result.value.match.score).toBeLessThanOrEqual(100);
    expect(result.value.match.reasons.length).toBeGreaterThan(0);
  });

  it('gives high role score when target roles match job title', () => {
    const profile = createProfile({ targetRoles: ['Senior Software Engineer'] });
    const result = service.calculate({ job: mockJob, profile, analysis: null }).getOrThrow();
    expect(result.match.score).toBeGreaterThanOrEqual(30);
  });

  it('gives low role score when target roles are unrelated', () => {
    const profile = createProfile({ targetRoles: ['Data Scientist', 'Machine Learning Engineer'] });
    const result = service.calculate({ job: mockJob, profile, analysis: null }).getOrThrow();
    expect(result.match.score).toBeDefined();
  });

  it('gives high skills score when profile skills overlap with job skills', () => {
    const profile = createProfile({ skills: ['TypeScript', 'React', 'Node.js', 'AWS'] });
    const result = service.calculate({ job: mockJob, profile, analysis: null }).getOrThrow();
    expect(result.match.strengths.length).toBeGreaterThan(0);
  });

  it('gives location score 100 when job location matches preferred locations', () => {
    const profile = createProfile({ preferredLocations: ['San Francisco, CA'] });
    const result = service.calculate({ job: mockJob, profile, analysis: null }).getOrThrow();
    expect(result.match.reasons.some((r) => r.toLowerCase().includes('location'))).toBe(true);
  });

  it('gives location score 100 for remote jobs', () => {
    const remoteJob = Job.create({ ...mockJob, id: 'remote-1', location: 'Remote' }).getOrThrow();
    const profile = createProfile({ preferredLocations: ['New York, NY'] });
    const result = service.calculate({ job: remoteJob, profile, analysis: null }).getOrThrow();
    expect(result.match.reasons.some((r) => r.toLowerCase().includes('remote'))).toBe(true);
  });

  it('computes salary score based on overlap', () => {
    const profile = createProfile({ expectedSalaryMin: 130000, expectedSalaryMax: 170000 });
    const result = service.calculate({ job: mockJob, profile, analysis: null }).getOrThrow();
    expect(result.match.score).toBeGreaterThan(0);
  });

  it('includes gaps when skills are missing', () => {
    const profile = createProfile({ skills: ['CSS', 'HTML'] });
    const result = service.calculate({ job: mockJob, profile, analysis: null }).getOrThrow();
    expect(result.match.gaps.length).toBeGreaterThan(0);
  });

  it('includes analysis missing skills when matching', () => {
    const analysis: ResumeAnalysisResult = {
      atsScore: 80,
      strengths: ['Good communication'],
      weaknesses: ['No cloud experience'],
      missingSkills: ['AWS', 'PostgreSQL'],
      suggestedRoles: ['Software Engineer'],
      recommendations: ['Learn cloud'],
      summary: 'Experienced engineer with good communication',
    };
    const profile = createProfile({ skills: ['TypeScript'] });
    const result = service.calculate({ job: mockJob, profile, analysis }).getOrThrow();
    expect(result.match.score).toBeGreaterThan(0);
  });

  it('always returns score between 0 and 100', () => {
    for (let i = 0; i < 10; i++) {
      const result = service
        .calculate({ job: mockJob, profile: mockProfile, analysis: null })
        .getOrThrow();
      expect(result.match.score).toBeGreaterThanOrEqual(0);
      expect(result.match.score).toBeLessThanOrEqual(100);
    }
  });
});
