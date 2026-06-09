import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseJobRepository } from '../repositories/supabase-job.repository';
import { Job } from '../entities/job';

function createMockJob(id = 'job-1'): Job {
  return Job.create({
    id,
    title: 'Software Engineer',
    company: 'TestCo',
    description: 'A great job',
    location: 'Remote',
    type: 'full-time',
    status: 'active',
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'USD',
    skills: ['TypeScript', 'React'],
    experienceRequired: 2,
    applicationUrl: 'https://example.com/apply',
    postedAt: new Date('2025-01-01'),
    expiresAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  }).getOrThrow();
}

function createMockSupabase(_fromResponse?: Record<string, unknown>) {
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockIn = vi.fn().mockReturnThis();
  const mockOverlaps = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockMaybeSingle = vi.fn().mockReturnThis();
  const mockFilter = vi.fn().mockReturnThis();
  const mockOr = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpsert = vi.fn().mockReturnThis();

  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    upsert: mockUpsert,
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
    in: mockIn,
    overlaps: mockOverlaps,
    order: mockOrder,
    limit: mockLimit,
    filter: mockFilter,
    or: mockOr,
    maybeSingle: mockMaybeSingle,
  });

  mockEq.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
    maybeSingle: mockMaybeSingle,
    overlaps: mockOverlaps,
    filter: mockFilter,
  });

  mockOrder.mockReturnValue({ limit: mockLimit });
  mockFilter.mockReturnValue({ or: mockOr });
  mockOr.mockReturnValue({ order: mockOrder });

  const supabase = {
    from: mockFrom,
  } as unknown as SupabaseClient;

  return {
    supabase,
    mockFrom,
    mockSelect,
    mockEq,
    mockIn,
    mockOverlaps,
    mockOrder,
    mockLimit,
    mockMaybeSingle,
    mockFilter,
    mockOr,
    mockInsert,
    mockUpsert,
  };
}

describe('SupabaseJobRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('returns null when job not found', async () => {
      const { supabase, mockMaybeSingle } = createMockSupabase();
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const repo = new SupabaseJobRepository(supabase);
      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('returns Job when found', async () => {
      const { supabase, mockMaybeSingle } = createMockSupabase();
      mockMaybeSingle.mockResolvedValue({
        data: {
          id: 'job-1',
          title: 'Engineer',
          company: 'Co',
          description: 'desc',
          location: 'Remote',
          type: 'full-time',
          status: 'active',
          salary_min: 80000,
          salary_max: 120000,
          currency: 'USD',
          skills: ['A', 'B'],
          experience_required: 2,
          application_url: 'https://apply',
          posted_at: '2025-01-01T00:00:00.000Z',
          expires_at: null,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
        error: null,
      });

      const repo = new SupabaseJobRepository(supabase);
      const result = await repo.findById('job-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('job-1');
      expect(result!.title).toBe('Engineer');
    });

    it('returns null on error', async () => {
      const { supabase, mockMaybeSingle } = createMockSupabase();
      mockMaybeSingle.mockResolvedValue({ data: null, error: new Error('DB error') });

      const repo = new SupabaseJobRepository(supabase);
      const result = await repo.findById('job-1');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('calls upsert with correct data', async () => {
      const { supabase, mockUpsert } = createMockSupabase();
      mockUpsert.mockResolvedValue({ error: null });

      const repo = new SupabaseJobRepository(supabase);
      const job = createMockJob();
      const result = await repo.save(job);

      expect(result.isSuccess()).toBe(true);
      expect(mockUpsert).toHaveBeenCalledOnce();
    });

    it('returns failure on error', async () => {
      const { supabase, mockUpsert } = createMockSupabase();
      mockUpsert.mockResolvedValue({ error: new Error('Constraint violation') });

      const repo = new SupabaseJobRepository(supabase);
      const job = createMockJob();
      const result = await repo.save(job);

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('upsertMany', () => {
    it('calls upsert with array of rows', async () => {
      const { supabase, mockUpsert } = createMockSupabase();
      mockUpsert.mockResolvedValue({ error: null });

      const repo = new SupabaseJobRepository(supabase);
      const jobs = [createMockJob('job-1'), createMockJob('job-2')];
      const result = await repo.upsertMany(jobs);

      expect(result.isSuccess()).toBe(true);
      expect(mockUpsert).toHaveBeenCalledOnce();
      const calls = mockUpsert.mock.calls;
      expect(calls[0]![0]).toHaveLength(2);
    });

    it('returns failure on error', async () => {
      const { supabase, mockUpsert } = createMockSupabase();
      mockUpsert.mockResolvedValue({ error: new Error('Batch insert failed') });

      const repo = new SupabaseJobRepository(supabase);
      const result = await repo.upsertMany([createMockJob()]);

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('findActiveJobs', () => {
    it('returns active, non-expired jobs ordered by posted_at desc', async () => {
      const { supabase, mockLimit, mockOrder } = createMockSupabase();
      mockLimit.mockResolvedValue({
        data: [
          {
            id: 'job-1',
            title: 'Engineer',
            company: 'Co',
            description: 'desc',
            location: 'Remote',
            type: 'full-time',
            status: 'active',
            salary_min: 80000,
            salary_max: 120000,
            currency: 'USD',
            skills: ['A', 'B'],
            experience_required: 2,
            application_url: 'https://apply',
            posted_at: '2025-01-02T00:00:00.000Z',
            expires_at: null,
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
          },
        ],
        error: null,
      });

      const repo = new SupabaseJobRepository(supabase);
      const result = await repo.findActiveJobs();

      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe('Engineer');
      expect(mockOrder).toHaveBeenCalled();
    });

    it('returns empty array on query error', async () => {
      const { supabase, mockLimit } = createMockSupabase();
      mockLimit.mockResolvedValue({ data: null, error: new Error('Query failed') });

      const repo = new SupabaseJobRepository(supabase);
      const result = await repo.findActiveJobs();

      expect(result).toEqual([]);
    });
  });

  describe('findBySkill', () => {
    it('queries with overlaps and returns jobs', async () => {
      const { supabase, mockOverlaps, mockEq } = createMockSupabase();
      mockOverlaps.mockReturnThis();
      mockEq.mockResolvedValue({
        data: [
          {
            id: 'job-1',
            title: 'Engineer',
            company: 'Co',
            description: 'desc',
            location: 'Remote',
            type: 'full-time',
            status: 'active',
            salary_min: null,
            salary_max: null,
            currency: 'USD',
            skills: ['TypeScript', 'React'],
            experience_required: 0,
            application_url: null,
            posted_at: '2025-01-01T00:00:00.000Z',
            expires_at: null,
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
          },
        ],
        error: null,
      });

      const repo = new SupabaseJobRepository(supabase);
      const result = await repo.findBySkill(['TypeScript']);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('job-1');
    });
  });
});
