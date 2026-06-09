import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseProfileRepository } from '../repositories/supabase-profile.repository';
import type { UserProfile } from '../entities/user-profile';

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockUpsert = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/shared/lib/supabase/client', () => ({
  createSupabaseBrowserClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

function mockRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'profile-1',
    user_id: 'user-1',
    name: 'John',
    headline: null,
    bio: null,
    avatar_url: null,
    location: null,
    skills: [],
    experience: 0,
    preferences: {},
    career_stage: 'experienced',
    target_roles: ['Frontend Developer'],
    preferred_locations: ['Remote'],
    expected_salary_min: null,
    expected_salary_max: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('SupabaseProfileRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
      delete: mockDelete,
    });

    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockDelete.mockReturnValue({ eq: mockEq });
  });

  describe('findById', () => {
    it('returns null when profile not found', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const repo = new SupabaseProfileRepository();
      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('returns UserProfile when found', async () => {
      mockMaybeSingle.mockResolvedValue({ data: mockRow(), error: null });

      const repo = new SupabaseProfileRepository();
      const result = await repo.findById('profile-1');

      expect(result).not.toBeNull();
      expect(result!.userId).toBe('user-1');
      expect(result!.name).toBe('John');
      expect(result!.careerStage).toBe('experienced');
    });

    it('returns null on error', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: new Error('DB error') });

      const repo = new SupabaseProfileRepository();
      const result = await repo.findById('profile-1');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns profile when user exists', async () => {
      mockMaybeSingle.mockResolvedValue({ data: mockRow(), error: null });

      const repo = new SupabaseProfileRepository();
      const result = await repo.findByUserId('user-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('profile-1');
    });

    it('returns null when no profile exists', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const repo = new SupabaseProfileRepository();
      const result = await repo.findByUserId('new-user');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('calls upsert with correct snake_case columns', async () => {
      mockUpsert.mockResolvedValue({ error: null });

      const repo = new SupabaseProfileRepository();
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        name: 'John',
        headline: null,
        bio: null,
        avatarUrl: null,
        location: null,
        skills: [],
        experience: 0,
        preferences: {},
        careerStage: 'experienced',
        targetRoles: ['Engineer'],
        preferredLocations: ['Remote'],
        expectedSalaryMin: null,
        expectedSalaryMax: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      } as unknown as UserProfile;

      const result = await repo.save(profile);

      expect(result.isSuccess()).toBe(true);
      expect(mockUpsert).toHaveBeenCalledOnce();
      const row = mockUpsert.mock.calls[0]![0];
      expect(row.user_id).toBe('user-1');
      expect(row.career_stage).toBe('experienced');
      expect(row.target_roles).toEqual(['Engineer']);
      expect(row.preferred_locations).toEqual(['Remote']);
    });

    it('returns failure on error', async () => {
      mockUpsert.mockResolvedValue({ error: new Error('Constraint violation') });

      const repo = new SupabaseProfileRepository();
      const result = await repo.save({ id: 'profile-1' } as unknown as UserProfile);

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('delete', () => {
    it('calls delete with correct id', async () => {
      mockEq.mockResolvedValue({ error: null });

      const repo = new SupabaseProfileRepository();
      await repo.delete('profile-1');

      expect(mockDelete).toHaveBeenCalledOnce();
      expect(mockEq).toHaveBeenCalledWith('id', 'profile-1');
    });
  });
});
