import { describe, it, expect } from 'vitest';
import { JobMatch } from '../entities/job-match';

describe('JobMatch', () => {
  const validData = {
    id: 'jm-1',
    jobId: 'job-1',
    userId: 'user-1',
    score: 75,
    reasons: ['Role matches', 'Strong skills overlap'],
    strengths: ['TypeScript', 'React'],
    gaps: ['AWS'],
    createdAt: new Date('2026-06-07'),
  };

  it('creates a JobMatch with valid data', () => {
    const result = JobMatch.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.id).toBe('jm-1');
    expect(result.value.score).toBe(75);
    expect(result.value.reasons).toEqual(['Role matches', 'Strong skills overlap']);
  });

  it('fails when id is empty', () => {
    const result = JobMatch.create({ ...validData, id: '' });
    expect(result.isSuccess()).toBe(false);
  });

  it('fails when jobId is empty', () => {
    const result = JobMatch.create({ ...validData, jobId: '' });
    expect(result.isSuccess()).toBe(false);
  });

  it('fails when userId is empty', () => {
    const result = JobMatch.create({ ...validData, userId: '' });
    expect(result.isSuccess()).toBe(false);
  });

  it('fails when score is below 0', () => {
    const result = JobMatch.create({ ...validData, score: -1 });
    expect(result.isSuccess()).toBe(false);
  });

  it('fails when score is above 100', () => {
    const result = JobMatch.create({ ...validData, score: 101 });
    expect(result.isSuccess()).toBe(false);
  });

  it('accepts score of 0', () => {
    const result = JobMatch.create({ ...validData, score: 0 });
    expect(result.isSuccess()).toBe(true);
  });

  it('accepts score of 100', () => {
    const result = JobMatch.create({ ...validData, score: 100 });
    expect(result.isSuccess()).toBe(true);
  });
});
