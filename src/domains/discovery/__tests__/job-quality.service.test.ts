import { describe, it, expect } from 'vitest';
import { NormalizedJob } from '../entities/normalized-job';
import { scoreJob, isQualityJob, filterQualityJobs } from '../services/job-quality.service';

function makeJob(overrides: Partial<Parameters<typeof NormalizedJob.create>[0]> = {}) {
  return NormalizedJob.create({
    id: 'j-1',
    title: 'Engineer',
    company: 'Co',
    location: 'Remote',
    salaryMin: null,
    salaryMax: null,
    currency: 'USD',
    skills: [],
    description: '',
    source: 'test',
    sourceUrl: '',
    postedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    ...overrides,
  });
}

describe('scoreJob', () => {
  it('scores 0 for an empty job', () => {
    const job = makeJob({
      company: '',
      postedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    });
    expect(scoreJob(job).total).toBe(0);
  });

  it('awards 25 for salary', () => {
    const job = makeJob({ salaryMin: 50000 });
    expect(scoreJob(job).breakdown.hasSalary).toBe(25);
  });

  it('awards 20 for long description', () => {
    const job = makeJob({ description: 'x'.repeat(100) });
    expect(scoreJob(job).breakdown.hasDescription).toBe(20);
  });

  it('awards 10 for short description', () => {
    const job = makeJob({ description: 'hello world' });
    expect(scoreJob(job).breakdown.hasDescription).toBe(10);
  });

  it('awards 20 for recent posting (within 30 days)', () => {
    const job = makeJob({ postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) });
    expect(scoreJob(job).breakdown.isRecent).toBe(20);
  });

  it('awards 10 for posting within 90 days', () => {
    const job = makeJob({ postedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) });
    expect(scoreJob(job).breakdown.isRecent).toBe(10);
  });

  it('awards 15 for company presence', () => {
    const job = makeJob({ company: 'Google' });
    expect(scoreJob(job).breakdown.hasCompany).toBe(15);
  });

  it('awards 20 for 3+ skills', () => {
    const job = makeJob({ skills: ['A', 'B', 'C'] });
    expect(scoreJob(job).breakdown.hasSkills).toBe(20);
  });

  it('awards 10 for 1-2 skills', () => {
    const job = makeJob({ skills: ['A'] });
    expect(scoreJob(job).breakdown.hasSkills).toBe(10);
  });

  it('perfect job scores 100', () => {
    const job = makeJob({
      salaryMin: 50000,
      description: 'x'.repeat(100),
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      company: 'Google',
      skills: ['A', 'B', 'C'],
    });
    expect(scoreJob(job).total).toBe(100);
  });
});

describe('isQualityJob', () => {
  it('returns true for jobs above 60', () => {
    const job = makeJob({ salaryMin: 80000, skills: ['A', 'B', 'C'], company: 'Google' });
    expect(isQualityJob(job)).toBe(true);
  });

  it('returns false for low quality jobs', () => {
    const job = makeJob();
    expect(isQualityJob(job)).toBe(false);
  });
});

describe('filterQualityJobs', () => {
  it('only keeps jobs above threshold', () => {
    const good = makeJob({
      id: 'good',
      salaryMin: 80000,
      skills: ['A', 'B', 'C'],
      company: 'Google',
    });
    const bad = makeJob({ id: 'bad' });
    const result = filterQualityJobs([good, bad]);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('good');
  });
});
