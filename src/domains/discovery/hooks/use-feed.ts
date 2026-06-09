'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '@/domains/profile/entities/user-profile';
import { JobMatchingService } from '../services/job-matching.service';
import { recordSwipeFeedback } from '../services/swipe-feedback.service';
import { UserFeedback } from '../entities/user-feedback';
import type { Job } from '../entities/job';
import { SupabaseApplicationRepository } from '@/domains/application/repositories/supabase-application.repository';
import { CreateApplicationUseCase } from '@/domains/application/use-cases/create-application.use-case';
import { SupabaseUserFeedbackRepository } from '../repositories/supabase-user-feedback.repository';
import { SupabaseJobRepository } from '../repositories/supabase-job.repository';
import { createSupabaseBrowserClient } from '@/shared/lib/supabase/client';

export interface FeedJob {
  job: Job;
  matchScore: number;
  matchReasons: string[];
}

const feedKeys = {
  feed: (userId: string) => ['feed', userId] as const,
};

async function generateFeedFromDb(userId: string, profile: UserProfile): Promise<FeedJob[]> {
  const supabase = createSupabaseBrowserClient();
  const jobRepo = new SupabaseJobRepository(supabase);
  const allJobs = await jobRepo.findActiveJobs(100);

  if (allJobs.length === 0) {
    return [];
  }

  const matchingService = new JobMatchingService();
  const feedJobs: FeedJob[] = [];

  for (const job of allJobs) {
    const matchResult = matchingService.calculate({ job, profile, analysis: null });
    if (matchResult.isSuccess()) {
      feedJobs.push({
        job,
        matchScore: matchResult.value.match.score,
        matchReasons: matchResult.value.match.reasons,
      });
    }
  }

  return feedJobs.sort((a, b) => b.matchScore - a.matchScore);
}

export function useFeed(userId: string | undefined, profile: UserProfile | null) {
  const queryClient = useQueryClient();

  const feedQuery = useQuery({
    queryKey: feedKeys.feed(userId ?? ''),
    queryFn: () => generateFeedFromDb(userId!, profile!),
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
      const feedbackRepo = new SupabaseUserFeedbackRepository();
      const feedback = new UserFeedback(userId!, jobId, 'save', new Date());
      await feedbackRepo.save(feedback);
      recordSwipeFeedback(userId!, jobId, 'save', null);
    },
    onSuccess: (_data, jobId) => {
      removeFromFeed(jobId);
    },
  });

  const passMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const feedbackRepo = new SupabaseUserFeedbackRepository();
      const feedback = new UserFeedback(userId!, jobId, 'pass', new Date());
      await feedbackRepo.save(feedback);
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
      const appRepo = new SupabaseApplicationRepository();
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
