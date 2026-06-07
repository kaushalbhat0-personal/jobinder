import { describe, it, expect } from 'vitest';
import { NormalizedJob } from '../entities/normalized-job';

function makeJob(overrides: Partial<Parameters<typeof NormalizedJob.create>[0]> = {}) {
  return NormalizedJob.create({
    id: 'nj-1',
    title: 'Software Engineer',
    company: 'TestCorp',
    location: 'Remote',
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'USD',
    skills: ['TypeScript', 'React'],
    description: 'A great job description',
    source: 'remoteok',
    sourceUrl: 'https://remoteok.com/job/1',
    postedAt: new Date('2026-06-01'),
    ...overrides,
  });
}

describe('NormalizedJob', () => {
  it('creates with initial source', () => {
    const job = makeJob();
    expect(job.sources).toEqual(['remoteok']);
    expect(job.id).toBe('nj-1');
  });

  describe('mergeSource', () => {
    it('merges sources from duplicate job', () => {
      const a = makeJob();
      const b = makeJob({
        id: 'nj-2',
        source: 'remotive',
        sourceUrl: 'https://remotive.com/job/2',
      });
      const merged = a.mergeSource(b);
      expect(merged.sources).toEqual(['remoteok', 'remotive']);
      expect(merged.id).toBe('nj-1');
    });

    it('merges skills', () => {
      const a = makeJob({ skills: ['TypeScript'] });
      const b = makeJob({ id: 'nj-2', source: 'remotive', skills: ['Python', 'TypeScript'] });
      const merged = a.mergeSource(b);
      expect(merged.skills).toEqual(['TypeScript', 'Python']);
    });

    it('keeps earliest postedAt', () => {
      const a = makeJob({ postedAt: new Date('2026-06-01') });
      const b = makeJob({ id: 'nj-2', source: 'remotive', postedAt: new Date('2026-06-10') });
      const merged = a.mergeSource(b);
      expect(merged.postedAt).toEqual(new Date('2026-06-01'));
    });
  });

  describe('hasSalary', () => {
    it('returns true if salaryMin exists', () => {
      expect(makeJob({ salaryMin: 50000 }).hasSalary()).toBe(true);
    });
    it('returns true if salaryMax exists', () => {
      expect(makeJob({ salaryMin: null, salaryMax: 100000 }).hasSalary()).toBe(true);
    });
    it('returns false if both null', () => {
      expect(makeJob({ salaryMin: null, salaryMax: null }).hasSalary()).toBe(false);
    });
  });

  describe('daysSincePosted', () => {
    it('returns 0 for today', () => {
      const job = makeJob({ postedAt: new Date() });
      expect(job.daysSincePosted()).toBe(0);
    });

    it('returns positive for past dates', () => {
      const job = makeJob({ postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) });
      expect(job.daysSincePosted()).toBe(5);
    });
  });

  describe('isRecent', () => {
    it('returns true for job posted within 30 days', () => {
      const job = makeJob({ postedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) });
      expect(job.isRecent()).toBe(true);
    });

    it('returns false for old jobs', () => {
      const job = makeJob({ postedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) });
      expect(job.isRecent()).toBe(false);
    });
  });
});
