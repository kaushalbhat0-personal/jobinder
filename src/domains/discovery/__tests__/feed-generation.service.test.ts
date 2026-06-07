import { describe, it, expect } from 'vitest';
import { FeedGenerationService } from '../services/feed-generation.service';
import { MockJobProvider } from '../providers/mock-job-provider';
import { JobMatchingService } from '../services/job-matching.service';
import { UserProfile } from '@/domains/profile/entities/user-profile';

const providers = [new MockJobProvider()];
const matchingService = new JobMatchingService();
const service = new FeedGenerationService(providers, matchingService);

const mockProfile = UserProfile.create({
  id: 'profile-1',
  userId: 'user-1',
  name: 'John Doe',
  headline: 'Engineer',
  bio: 'Experienced engineer',
  avatarUrl: null,
  location: null,
  skills: ['TypeScript', 'React', 'Node.js'],
  experience: 5,
  preferences: {},
  careerStage: 'experienced',
  targetRoles: ['Software Engineer'],
  preferredLocations: ['San Francisco, CA'],
  expectedSalaryMin: 120000,
  expectedSalaryMax: 180000,
  createdAt: new Date(),
  updatedAt: new Date(),
}).getOrThrow();

describe('FeedGenerationService', () => {
  it('generates feed with matches', async () => {
    const result = await service.generate('gen-1', 'user-1', 'manual', mockProfile, null);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.generation.status).toBe('completed');
    expect(result.value.generation.jobCount).toBeGreaterThan(0);
    expect(result.value.feed.items.length).toBeGreaterThan(0);
    expect(result.value.feed.items[0]!.score).toBeGreaterThanOrEqual(0);
  });

  it('sorts feed by score descending', async () => {
    const result = await service.generate('gen-2', 'user-1', 'manual', mockProfile, null);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    const scores = result.value.feed.items.map((i) => i.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]!);
    }
  });

  it('returns generation with correct userId', async () => {
    const result = await service.generate('gen-3', 'user-1', 'refresh', mockProfile, null);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.generation.userId).toBe('user-1');
    expect(result.value.generation.source).toBe('refresh');
  });
});
