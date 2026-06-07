'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/shared/ui/organisms';
import { useAuth } from '@/hooks/use-auth';
import { useDiscoveryStore } from '@/domains/discovery/stores/discovery-store';
import { SwipeUseCase } from '@/domains/discovery/use-cases/swipe.use-case';
import { InMemoryDiscoveryRepository } from '@/domains/discovery/repositories/in-memory-discovery-repository';
import { SwipeSession } from '@/domains/discovery/entities/swipe-session';
import { SwipeFeedPage } from '@/domains/discovery/components/SwipeFeedPage';
import { MockJobProvider } from '@/domains/discovery/providers/mock-job-provider';
import { JobMatchingService } from '@/domains/discovery/services/job-matching.service';
import { FeedGenerationService } from '@/domains/discovery/services/feed-generation.service';
import { UserProfile } from '@/domains/profile/entities/user-profile';
import type { SwipeDirection } from '@/domains/discovery/entities/swipe-session';
import type { Job } from '@/domains/discovery/entities/job';

const repo = new InMemoryDiscoveryRepository();
const swipeUseCase = new SwipeUseCase(repo);

export default function DiscoveryPage() {
  const { user } = useAuth();
  const { setFeed, setSession, session } = useDiscoveryStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const provider = new MockJobProvider();
      const jobsResult = await provider.fetchJobs();
      if (jobsResult.isSuccess()) {
        const allJobs = jobsResult.value;
        repo.jobs = allJobs;
        setJobs(allJobs);
      }

      const profile = UserProfile.create({
        id: `profile-${user.id}`,
        userId: user.id,
        name: user.name ?? 'User',
        headline: null,
        bio: null,
        avatarUrl: null,
        location: null,
        skills: ['TypeScript', 'React', 'Node.js'],
        experience: 3,
        preferences: {},
        careerStage: 'experienced',
        targetRoles: ['Software Engineer'],
        preferredLocations: ['Remote'],
        expectedSalaryMin: 100000,
        expectedSalaryMax: 150000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getOrThrow();

      const feedService = new FeedGenerationService([provider], new JobMatchingService());
      const genResult = await feedService.generate(
        `gen-${user.id}`,
        user.id,
        'manual',
        profile,
        null,
      );
      if (genResult.isSuccess()) {
        await repo.saveFeed(genResult.value.feed);
        setFeed(genResult.value.feed);
      }

      const existing = await repo.getActiveSession(user.id);
      if (!existing) {
        const newSession = SwipeSession.create({
          id: `session-${user.id}-${Date.now()}`,
          userId: user.id,
          status: 'active',
          actions: [],
          startedAt: new Date(),
          completedAt: null,
          createdAt: new Date(),
        }).getOrThrow();
        await repo.saveSession(newSession);
        setSession(newSession);
      } else {
        setSession(existing);
      }

      setIsReady(true);
    };
    init();
  }, [user, setFeed, setSession]);

  const handleSwipe = useCallback(
    async (jobId: string, direction: SwipeDirection, score: number | null) => {
      if (!user) return;
      const result = await swipeUseCase.execute(user.id, jobId, direction, score);
      if (result.isSuccess()) {
        setSession(result.value);
      }
    },
    [user, setSession],
  );

  const handleUndo = useCallback(async () => {
    if (!user || !session) return;
    const undone = session.undoLastAction();
    const saveResult = await repo.saveSession(undone);
    if (saveResult.isSuccess()) {
      setSession(undone);
    }
  }, [user, session, setSession]);

  if (!isReady) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-neutral-500">Loading feed...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Discover" />
      <SwipeFeedPage jobs={jobs} session={session} onSwipe={handleSwipe} onUndo={handleUndo} />
    </>
  );
}
