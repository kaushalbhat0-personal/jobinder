import { describe, it, expect } from 'vitest';
import { Job } from '../entities/job';

const validData = {
  id: 'job-1',
  title: 'Software Engineer',
  company: 'Acme Corp',
  description: 'Build stuff',
  location: 'Remote',
  type: 'full-time' as const,
  status: 'active' as const,
  salaryMin: 100000,
  salaryMax: 150000,
  currency: 'USD',
  skills: ['TypeScript', 'React'],
  experienceRequired: 3,
  applicationUrl: null,
  postedAt: new Date('2024-01-01'),
  expiresAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('Job entity', () => {
  it('creates with valid data', () => {
    const result = Job.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.title).toBe('Software Engineer');
      expect(result.value.isActive()).toBe(true);
    }
  });

  it('fails when id is empty', () => {
    const result = Job.create({ ...validData, id: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when title is empty', () => {
    const result = Job.create({ ...validData, title: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when company is empty', () => {
    const result = Job.create({ ...validData, company: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when experience is negative', () => {
    const result = Job.create({ ...validData, experienceRequired: -1 });
    expect(result.isFailure()).toBe(true);
  });

  it('detects expired job', () => {
    const result = Job.create({ ...validData, expiresAt: new Date('2020-01-01') });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.isExpired()).toBe(true);
      expect(result.value.isActive()).toBe(false);
    }
  });
});
