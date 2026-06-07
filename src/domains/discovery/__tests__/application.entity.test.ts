import { describe, it, expect } from 'vitest';
import { Application } from '../entities/application';

const validData = {
  id: 'app-1',
  userId: 'user-1',
  jobId: 'job-1',
  resumeId: 'res-1',
  coverLetter: 'I am a great fit',
  status: 'draft' as const,
  notes: null,
  submittedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Application entity', () => {
  it('creates with valid data', () => {
    const result = Application.create(validData);
    expect(result.isSuccess()).toBe(true);
  });

  it('fails without job id', () => {
    const result = Application.create({ ...validData, jobId: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('submits a draft application', () => {
    const result = Application.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const submitted = result.value.submit();
      expect(submitted.isSuccess()).toBe(true);
      if (submitted.isSuccess()) {
        expect(submitted.value.status).toBe('submitted');
        expect(submitted.value.submittedAt).not.toBeNull();
      }
    }
  });

  it('fails to submit a non-draft application', () => {
    const result = Application.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const submitted = result.value.submit();
      expect(submitted.isSuccess()).toBe(true);
      if (submitted.isSuccess()) {
        const secondSubmit = submitted.value.submit();
        expect(secondSubmit.isFailure()).toBe(true);
      }
    }
  });

  it('withdraws an application', () => {
    const result = Application.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.withdraw().status).toBe('withdrawn');
    }
  });
});
