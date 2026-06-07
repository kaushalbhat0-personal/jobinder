import { describe, it, expect } from 'vitest';
import { NormalizedJob } from '../entities/normalized-job';
import { deduplicateJobs } from '../services/job-deduplication.service';

function job(id: string, title: string, company: string, source: string) {
  return NormalizedJob.create({
    id,
    title,
    company,
    source,
    sourceUrl: `https://example.com/${id}`,
    postedAt: new Date('2026-06-01'),
    location: null,
    salaryMin: null,
    salaryMax: null,
    currency: 'USD',
    skills: [],
    description: '',
  });
}

describe('deduplicateJobs', () => {
  it('returns unique jobs unchanged', () => {
    const jobs = [
      job('1', 'Software Engineer', 'Google', 'remoteok'),
      job('2', 'Product Manager', 'Meta', 'remotive'),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(2);
  });

  it('merges same job from different sources', () => {
    const jobs = [
      job('1', 'Software Engineer', 'Google', 'remoteok'),
      job('2', 'Software Engineer', 'Google', 'remotive'),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(1);
    expect(result[0]!.sources).toEqual(['remoteok', 'remotive']);
  });

  it('does not merge different jobs with same company', () => {
    const jobs = [
      job('1', 'Software Engineer', 'Google', 'remoteok'),
      job('2', 'Product Manager', 'Google', 'remotive'),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(2);
  });

  it('does not merge same title at different companies', () => {
    const jobs = [
      job('1', 'Software Engineer', 'Google', 'remoteok'),
      job('2', 'Software Engineer', 'Meta', 'remotive'),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(2);
  });

  it('matches partial title similarity', () => {
    const jobs = [
      job('1', 'Senior Software Engineer', 'Google', 'remoteok'),
      job('2', 'Software Engineer', 'Google', 'remotive'),
    ];
    const result = deduplicateJobs(jobs);
    expect(result).toHaveLength(1);
  });
});
