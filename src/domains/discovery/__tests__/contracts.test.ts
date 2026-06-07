/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import type { DiscoveryQueryContract } from '../contracts/discovery-queries';
import type { JobProviderContract } from '../contracts/job-provider.contract';
import type { JobMatchingContract } from '../contracts/job-matching.contract';
import type { FeedGenerationContract } from '../contracts/feed-generation.contract';

describe('Discovery contracts', () => {
  it('DiscoveryQueryContract defines required methods', () => {
    const contract: DiscoveryQueryContract = {
      getFeed: async () => [],
      getJobDetails: async () => null,
      getReferralStatus: async () => null,
      getApplicationStatus: async () => null,
    };
    expect(contract.getFeed).toBeDefined();
    expect(contract.getJobDetails).toBeDefined();
    expect(contract.getReferralStatus).toBeDefined();
    expect(contract.getApplicationStatus).toBeDefined();
  });

  it('JobProviderContract defines required methods', () => {
    const contract: JobProviderContract = {
      name: 'test',
      fetchJobs: async () => ({ isSuccess: () => true, value: [] }) as any,
      searchJobs: async () => ({ isSuccess: () => true, value: [] }) as any,
      getJobById: async () => ({ isSuccess: () => true, value: null }) as any,
    } as unknown as JobProviderContract;
    expect(contract.name).toBe('test');
    expect(typeof contract.fetchJobs).toBe('function');
    expect(typeof contract.searchJobs).toBe('function');
    expect(typeof contract.getJobById).toBe('function');
  });

  it('JobMatchingContract defines required methods', () => {
    const contract = {
      calculate: async () => ({ isSuccess: () => true, value: { match: {} } }) as any,
      batchCalculate: async () => ({ isSuccess: () => true, value: [] }) as any,
    } as unknown as JobMatchingContract;
    expect(typeof contract.calculate).toBe('function');
    expect(typeof contract.batchCalculate).toBe('function');
  });

  it('FeedGenerationContract defines required methods', () => {
    const contract = {
      generate: async () =>
        ({ isSuccess: () => true, value: { generation: {}, matches: [] } }) as any,
      refresh: async () =>
        ({ isSuccess: () => true, value: { generation: {}, matches: [] } }) as any,
      getStatus: async () => ({ isSuccess: () => true, value: 'pending' }) as any,
      getHistory: async () => ({ isSuccess: () => true, value: [] }) as any,
    } as unknown as FeedGenerationContract;
    expect(typeof contract.generate).toBe('function');
    expect(typeof contract.refresh).toBe('function');
    expect(typeof contract.getStatus).toBe('function');
    expect(typeof contract.getHistory).toBe('function');
  });
});
