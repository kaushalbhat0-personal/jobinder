import { describe, it, expect, vi } from 'vitest';
import { GenerateFeedUseCase } from '../use-cases/generate-feed.use-case';
import { RefreshFeedUseCase } from '../use-cases/refresh-feed.use-case';
import { FeedGenerationService } from '../services/feed-generation.service';
import { JobMatchingService } from '../services/job-matching.service';
import { MockJobProvider } from '../providers/mock-job-provider';
import { UserProfile } from '@/domains/profile/entities/user-profile';
import type { DiscoveryRepository } from '../repositories/discovery-repository';
import { Feed } from '../entities/feed';
import { success } from '@/shared/core/result';

const mockProfile = UserProfile.create({
  id: 'profile-1',
  userId: 'user-1',
  name: 'John Doe',
  headline: null,
  bio: '',
  avatarUrl: null,
  location: null,
  skills: ['TypeScript', 'React'],
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

function createMockRepo(): DiscoveryRepository {
  const emptyFeed = Feed.create({
    id: 'feed-1',
    userId: 'user-1',
    items: [],
    cursor: null,
    hasMore: false,
    generatedAt: new Date(),
    createdAt: new Date(),
  }).getOrThrow();
  return {
    getFeed: vi.fn().mockResolvedValue(null),
    saveFeed: vi.fn().mockResolvedValue(success(emptyFeed)),
    getActiveSession: vi.fn().mockResolvedValue(null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveSession: vi.fn().mockResolvedValue(success({} as any)),
  };
}

describe('GenerateFeedUseCase', () => {
  it('generates and saves feed', async () => {
    const repo = createMockRepo();
    const feedService = new FeedGenerationService(
      [new MockJobProvider()],
      new JobMatchingService(),
    );
    const useCase = new GenerateFeedUseCase(feedService, repo);

    const result = await useCase.execute('user-1', mockProfile, null);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.feed.items.length).toBeGreaterThan(0);
    expect(repo.saveFeed).toHaveBeenCalled();
  });
});

describe('RefreshFeedUseCase', () => {
  it('refreshes and saves feed', async () => {
    const repo = createMockRepo();
    const feedService = new FeedGenerationService(
      [new MockJobProvider()],
      new JobMatchingService(),
    );
    const useCase = new RefreshFeedUseCase(feedService, repo);

    const result = await useCase.execute('user-1', mockProfile, null);
    expect(result.isSuccess()).toBe(true);
    expect(repo.saveFeed).toHaveBeenCalled();
  });
});
