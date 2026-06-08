'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '@/domains/profile/entities/user-profile';
import { MockJobProvider } from '../providers/mock-job-provider';
import { JobMatchingService } from '../services/job-matching.service';
import { FeedGenerationService } from '../services/feed-generation.service';
import { recordSwipeFeedback } from '../services/swipe-feedback.service';
import type { Job } from '../entities/job';
import { InMemoryApplicationRepository } from '@/domains/application/repositories/in-memory-application.repository';
import { CreateApplicationUseCase } from '@/domains/application/use-cases/create-application.use-case';

export interface FeedJob {
  job: Job;
  matchScore: number;
  matchReasons: string[];
}

const feedKeys = {
  feed: (userId: string) => ['feed', userId] as const,
};

async function generateFeed(userId: string, profile: UserProfile): Promise<FeedJob[]> {
  const provider = new MockJobProvider();
  const matchingService = new JobMatchingService();
  const feedService = new FeedGenerationService([provider], matchingService);

  const jobsResult = await provider.fetchJobs();
  if (!jobsResult.isSuccess()) throw new Error('Failed to fetch jobs');
  const jobs = jobsResult.value;

  const genResult = await feedService.generate(
    `gen-feed-${userId}-${Date.now()}`,
    userId,
    'manual',
    profile,
    null,
  );
  if (!genResult.isSuccess()) throw new Error('Failed to generate feed');

  const feed = genResult.value.feed;
  const itemMap = new Map(feed.items.map((i) => [i.id, i]));

  return jobs
    .filter((j) => itemMap.has(j.id))
    .map((j) => ({
      job: j,
      matchScore: itemMap.get(j.id)!.score,
      matchReasons: ((itemMap.get(j.id)!.payload.reason as string) || '')
        .split('; ')
        .filter(Boolean),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function useFeed(userId: string | undefined, profile: UserProfile | null) {
  const queryClient = useQueryClient();

  const feedQuery = useQuery({
    queryKey: feedKeys.feed(userId ?? ''),
    queryFn: () => generateFeed(userId!, profile!),
    enabled: !!userId && !!profile,
  });

  const removeFromFeed = useCallback(
    (jobId: string) => {
      queryClient.setQueryData<FeedJob[]>(feedKeys.feed(userId ?? ''), (old) =>
        old?.filter((fj) => fj.job.id !== jobId),
      );
    },
    [queryClient, userId],
  );

  const saveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      recordSwipeFeedback(userId!, jobId, 'save', null);
    },
    onSuccess: (_data, jobId) => {
      removeFromFeed(jobId);
    },
  });

  const passMutation = useMutation({
    mutationFn: async (jobId: string) => {
      recordSwipeFeedback(userId!, jobId, 'left', null);
    },
    onSuccess: (_data, jobId) => {
      removeFromFeed(jobId);
    },
  });

  const applyMutation = useMutation({
    mutationFn: async ({
      jobId,
      company,
      role,
    }: {
      jobId: string;
      company: string;
      role: string;
    }) => {
      const appRepo = new InMemoryApplicationRepository();
      const createApp = new CreateApplicationUseCase(appRepo);

      await createApp.execute({
        id: `app-${userId}-${jobId}-${Date.now()}`,
        userId: userId!,
        jobId,
        company,
        role,
        stage: 'applied',
      });

      recordSwipeFeedback(userId!, jobId, 'up', null);
    },
    onSuccess: (_data, { jobId }) => {
      removeFromFeed(jobId);
    },
  });

  const saveJob = useCallback((jobId: string) => saveMutation.mutate(jobId), [saveMutation]);

  const passJob = useCallback((jobId: string) => passMutation.mutate(jobId), [passMutation]);

  const applyToJob = useCallback(
    (jobId: string, company: string, role: string) =>
      applyMutation.mutate({ jobId, company, role }),
    [applyMutation],
  );

  return {
    feedJobs: feedQuery.data,
    isLoading: feedQuery.isLoading,
    error: feedQuery.error,
    refetch: feedQuery.refetch,
    saveJob,
    passJob,
    applyToJob,
    isSaving: saveMutation.isPending,
    isPassing: passMutation.isPending,
    isApplying: applyMutation.isPending,
  };
}
