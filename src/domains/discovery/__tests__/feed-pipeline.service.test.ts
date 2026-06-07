import { describe, it, expect } from 'vitest';
import { FeedPipelineService } from '../services/feed-pipeline.service';
import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import { NormalizedJob } from '../entities/normalized-job';

function makeNj(
  id: string,
  title: string,
  company: string,
  source: string,
  overrides: Partial<Parameters<typeof NormalizedJob.create>[0]> = {},
) {
  return NormalizedJob.create({
    id,
    title,
    company,
    source,
    sourceUrl: '',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    location: null,
    salaryMin: null,
    salaryMax: null,
    currency: 'USD',
    skills: [],
    description: '',
    ...overrides,
  });
}

describe('FeedPipelineService', () => {
  it('returns jobs that pass quality gate', async () => {
    const provider: NormalizedJobProvider = {
      name: 'test',
      fetchJobs: async () => [
        makeNj('1', 'Engineer', 'GoodCo', 'test', {
          salaryMin: 80000,
          skills: ['A', 'B', 'C'],
          description: 'x'.repeat(100),
        }),
        makeNj('2', 'Engineer', 'BadCo', 'test'),
      ],
    };

    const pipeline = new FeedPipelineService([provider]);
    const result = await pipeline.execute();

    expect(result.totalFetched).toBe(2);
    expect(result.afterQuality).toBe(1);
    expect(result.jobs).toHaveLength(1);
    expect(result.sources).toEqual(['test']);
  });

  it('deduplicates same job from multiple sources', async () => {
    const provider: NormalizedJobProvider = {
      name: 'multi',
      fetchJobs: async () => [
        makeNj('1', 'Software Engineer', 'Google', 'source-a', {
          salaryMin: 80000,
          skills: ['A', 'B', 'C'],
          description: 'x'.repeat(100),
        }),
        makeNj('2', 'Software Engineer', 'Google', 'source-b', {
          salaryMin: 80000,
          skills: ['A', 'B', 'C'],
          description: 'x'.repeat(100),
        }),
      ],
    };

    const pipeline = new FeedPipelineService([provider]);
    const result = await pipeline.execute();

    expect(result.totalFetched).toBe(2);
    expect(result.afterDedup).toBe(1);
  });

  it('reports sources from providers that returned jobs', async () => {
    const provider: NormalizedJobProvider = {
      name: 'provider-a',
      fetchJobs: async () => [
        makeNj('1', 'Engineer', 'Co', 'provider-a', {
          salaryMin: 80000,
          skills: ['A', 'B', 'C'],
          description: 'x'.repeat(100),
        }),
      ],
    };
    const provider2: NormalizedJobProvider = {
      name: 'provider-b',
      fetchJobs: async () => [],
    };

    const pipeline = new FeedPipelineService([provider, provider2]);
    const result = await pipeline.execute();
    expect(result.sources).toEqual(['provider-a']);
  });

  it('includes sourceHealth and syncRuns in result', async () => {
    const provider: NormalizedJobProvider = {
      name: 'test-source',
      fetchJobs: async () => [
        makeNj('1', 'Engineer', 'Co', 'test-source', {
          salaryMin: 80000,
          skills: ['A', 'B', 'C'],
          description: 'x'.repeat(100),
        }),
      ],
    };

    const pipeline = new FeedPipelineService([provider]);
    const result = await pipeline.execute();

    expect(result.sourceHealth).toHaveLength(1);
    expect(result.sourceHealth[0]!.source).toBe('test-source');
    expect(result.sourceHealth[0]!.totalRuns).toBe(1);

    expect(result.syncRuns).toHaveLength(1);
    expect(result.syncRuns[0]!.provider).toBe('test-source');
    expect(result.syncRuns[0]!.jobsFetched).toBe(1);
  });

  it('getSourceHealth returns metrics without running sync', () => {
    const provider: NormalizedJobProvider = {
      name: 'idle',
      fetchJobs: async () => [],
    };

    const pipeline = new FeedPipelineService([provider]);
    const health = pipeline.getSourceHealth();
    expect(health).toHaveLength(1);
    expect(health[0]!.source).toBe('idle');
    expect(health[0]!.totalRuns).toBe(0);
  });
});
