import { describe, it, expect } from 'vitest';
import { MockJobProvider } from '../providers/mock-job-provider';
import type { JobProviderContract } from '../contracts/job-provider.contract';

describe('JobProviderContract', () => {
  const provider: JobProviderContract = new MockJobProvider();

  it('satisfies the contract', () => {
    expect(typeof provider.name).toBe('string');
    expect(typeof provider.fetchJobs).toBe('function');
    expect(typeof provider.searchJobs).toBe('function');
    expect(typeof provider.getJobById).toBe('function');
  });
});
