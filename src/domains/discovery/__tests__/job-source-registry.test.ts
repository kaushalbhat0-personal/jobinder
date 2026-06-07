import { describe, it, expect, beforeEach } from 'vitest';
import { JobSourceRegistry } from '../providers/job-source-registry';
import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import { NormalizedJob } from '../entities/normalized-job';

function makeProvider(name: string, jobs: NormalizedJob[] = []): NormalizedJobProvider {
  return {
    name,
    fetchJobs: async () => jobs,
  };
}

describe('JobSourceRegistry', () => {
  let registry: JobSourceRegistry;

  beforeEach(() => {
    registry = new JobSourceRegistry();
  });

  it('registers and retrieves providers', () => {
    const p = makeProvider('remoteok');
    registry.registerProvider(p);
    expect(registry.getProviders()).toHaveLength(1);
    expect(registry.getProvider('remoteok')).toBe(p);
  });

  it('fetchAll combines jobs from all providers', async () => {
    const a = makeProvider('a', [
      NormalizedJob.create({
        id: '1',
        title: 'A',
        company: 'Co',
        description: '',
        source: 'a',
        sourceUrl: '',
        postedAt: new Date(),
        location: null,
        salaryMin: null,
        salaryMax: null,
        currency: 'USD',
        skills: [],
      }),
    ]);
    const b = makeProvider('b', [
      NormalizedJob.create({
        id: '2',
        title: 'B',
        company: 'Co',
        description: '',
        source: 'b',
        sourceUrl: '',
        postedAt: new Date(),
        location: null,
        salaryMin: null,
        salaryMax: null,
        currency: 'USD',
        skills: [],
      }),
    ]);
    registry.registerProvider(a);
    registry.registerProvider(b);

    const all = await registry.fetchAll();
    expect(all).toHaveLength(2);
  });

  it('refreshProvider fetches from a specific provider', async () => {
    const p = makeProvider('remoteok');
    registry.registerProvider(p);
    const jobs = await registry.refreshProvider('remoteok');
    expect(jobs).toEqual([]);
  });

  it('refreshProvider returns empty for unknown provider', async () => {
    const jobs = await registry.refreshProvider('nonexistent');
    expect(jobs).toEqual([]);
  });
});
