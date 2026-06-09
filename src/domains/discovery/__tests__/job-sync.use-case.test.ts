import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import type { SupabaseJobRepository } from '../repositories/supabase-job.repository';
import type { SyncRunRepository } from '../repositories/supabase-sync-run.repository';
import type { JobSourceRepository } from '../repositories/supabase-job-source.repository';
import { JobSyncUseCase } from '../use-cases/job-sync.use-case';

function createMockProviders(): NormalizedJobProvider[] {
  return [
    {
      name: 'test-a',
      fetchJobs: vi.fn().mockResolvedValue([
        {
          id: 'a-1',
          title: 'Engineer',
          company: 'GoodCo',
          description: 'x'.repeat(100),
          location: 'Remote',
          salaryMin: 80000,
          salaryMax: 120000,
          currency: 'USD',
          skills: ['TypeScript', 'React', 'Node.js'],
          source: 'test-a',
          sourceUrl: 'https://example.com/job',
          postedAt: new Date(),
          experienceRequired: 0,
          sources: ['test-a'],
          toJobType: () => 'full-time' as const,
          hasSalary: () => true,
          daysSincePosted: () => 1,
          isRecent: () => true,
          mergeSource: vi.fn(),
        },
      ]),
    },
  ];
}

function createMockJobRepo(): SupabaseJobRepository {
  return {
    upsertMany: vi
      .fn()
      .mockResolvedValue({ isSuccess: () => true, isFailure: () => false, value: [] }),
    findActiveJobs: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    findByIds: vi.fn(),
    findBySkill: vi.fn(),
    save: vi.fn(),
  } as unknown as SupabaseJobRepository;
}

function createMockSyncRunRepo(): SyncRunRepository {
  return {
    insert: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockJobSourceRepo(): JobSourceRepository {
  return {
    upsert: vi.fn().mockResolvedValue(undefined),
  };
}

describe('JobSyncUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs pipeline and persists jobs', async () => {
    const providers = createMockProviders();
    const jobRepo = createMockJobRepo();
    const syncRunRepo = createMockSyncRunRepo();
    const jobSourceRepo = createMockJobSourceRepo();

    const useCase = new JobSyncUseCase(providers, jobRepo, syncRunRepo, jobSourceRepo);
    const result = await useCase.execute();

    expect(result.totalFetched).toBe(1);
    expect(result.totalPersisted).toBeGreaterThan(0);
    expect(jobRepo.upsertMany).toHaveBeenCalledOnce();
    expect(syncRunRepo.insert).toHaveBeenCalledOnce();
    expect(jobSourceRepo.upsert).toHaveBeenCalled();
  });

  it('collects errors without throwing', async () => {
    const providers = createMockProviders();
    const jobRepo = createMockJobRepo();
    const syncRunRepo: SyncRunRepository = {
      insert: vi.fn().mockRejectedValue(new Error('DB write failed')),
    };
    const jobSourceRepo = createMockJobSourceRepo();

    const useCase = new JobSyncUseCase(providers, jobRepo, syncRunRepo, jobSourceRepo);
    const result = await useCase.execute();

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('DB write failed');
    expect(result.totalFetched).toBe(1);
  });

  it('returns empty result when no providers configured', async () => {
    const jobRepo = createMockJobRepo();
    const syncRunRepo = createMockSyncRunRepo();
    const jobSourceRepo = createMockJobSourceRepo();

    const useCase = new JobSyncUseCase([], jobRepo, syncRunRepo, jobSourceRepo);
    const result = await useCase.execute();

    expect(result.totalFetched).toBe(0);
    expect(result.totalPersisted).toBe(0);
    expect(jobRepo.upsertMany).not.toHaveBeenCalled();
  });

  it('handles persist failure gracefully', async () => {
    const providers = createMockProviders();
    const jobRepo: SupabaseJobRepository = {
      upsertMany: vi.fn().mockResolvedValue({
        isSuccess: () => false,
        isFailure: () => true,
        error: { message: 'Upsert failed' },
      }),
      findActiveJobs: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(),
      findBySkill: vi.fn(),
      save: vi.fn(),
    } as unknown as SupabaseJobRepository;
    const syncRunRepo = createMockSyncRunRepo();
    const jobSourceRepo = createMockJobSourceRepo();

    const useCase = new JobSyncUseCase(providers, jobRepo, syncRunRepo, jobSourceRepo);
    const result = await useCase.execute();

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Upsert failed');
  });

  it('includes sync run metadata in result', async () => {
    const providers = createMockProviders();
    const jobRepo = createMockJobRepo();
    const syncRunRepo = createMockSyncRunRepo();
    const jobSourceRepo = createMockJobSourceRepo();

    const useCase = new JobSyncUseCase(providers, jobRepo, syncRunRepo, jobSourceRepo);
    const result = await useCase.execute();

    expect(result.syncRuns).toHaveLength(1);
    expect(result.syncRuns[0]!.provider).toBe('test-a');
    expect(result.syncRuns[0]!.jobsFetched).toBe(1);
    expect(result.syncRuns[0]!.duration).toBeGreaterThanOrEqual(0);
  });
});
