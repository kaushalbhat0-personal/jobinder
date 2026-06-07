import { describe, it, expect } from 'vitest';
import { Referral } from '../entities/referral';

const validData = {
  id: 'ref-1',
  userId: 'user-1',
  jobId: 'job-1',
  referrerName: 'Jane Smith',
  referrerEmail: 'jane@example.com',
  message: 'Great candidate',
  status: 'pending' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Referral entity', () => {
  it('creates with valid data', () => {
    const result = Referral.create(validData);
    expect(result.isSuccess()).toBe(true);
  });

  it('fails without job id', () => {
    const result = Referral.create({ ...validData, jobId: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails with invalid email', () => {
    const result = Referral.create({ ...validData, referrerEmail: 'not-email' });
    expect(result.isFailure()).toBe(true);
  });

  it('accepts a referral', () => {
    const result = Referral.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.accept().status).toBe('accepted');
    }
  });

  it('rejects a referral', () => {
    const result = Referral.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.reject().status).toBe('rejected');
    }
  });
});
