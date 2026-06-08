'use client';

import { PageHeader, LoadingState, EmptyState } from '@/shared/ui/organisms';
import { Text, Button } from '@/shared/ui/atoms';
import { useAuth } from '@/hooks/use-auth';
import { useProfileStore } from '@/domains/profile/stores/profile-store';
import { UserProfile } from '@/domains/profile/entities/user-profile';
import { useFeed } from '@/domains/discovery/hooks/use-feed';
import { JobCard } from '@/domains/discovery/components/JobCard';
import { useMemo } from 'react';

function getOrCreateProfile(
  userId: string,
  name: string,
  existing: UserProfile | null,
): UserProfile {
  if (existing) return existing;

  return UserProfile.create({
    id: `profile-${userId}`,
    userId,
    name: name || 'User',
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
}

export default function FeedPage() {
  const { user } = useAuth();
  const profile = useProfileStore((s) => s.profile);

  const readyProfile = useMemo(() => {
    if (!user) return null;
    return getOrCreateProfile(user.id, user.name ?? 'User', profile);
  }, [user, profile]);

  const {
    feedJobs,
    isLoading,
    error,
    refetch,
    saveJob,
    passJob,
    applyToJob,
    isSaving,
    isPassing,
    isApplying,
  } = useFeed(user?.id, readyProfile);

  if (!user) {
    return (
      <>
        <PageHeader title="Job Feed" />
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            title="Sign in to view jobs"
            description="Please sign in to see your personalized job feed."
          />
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Job Feed" />
        <LoadingState message="Finding jobs matched to your profile..." fullPage />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Job Feed" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <Text variant="body-md" className="text-danger-500">
            {error instanceof Error ? error.message : 'Failed to load feed'}
          </Text>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </>
    );
  }

  if (!feedJobs || feedJobs.length === 0) {
    return (
      <>
        <PageHeader title="Job Feed" />
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            icon={
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            }
            title="No jobs available yet"
            description="Complete your onboarding and check back later for personalized recommendations."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Refresh
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Job Feed"
        description={`${feedJobs.length} jobs matched to your profile`}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {feedJobs.map((fj) => (
          <JobCard
            key={fj.job.id}
            job={fj.job}
            matchScore={fj.matchScore}
            matchReasons={fj.matchReasons}
            onSave={saveJob}
            onPass={passJob}
            onApply={(jobId) => applyToJob(jobId, fj.job.company, fj.job.title)}
            isSaving={isSaving}
            isPassing={isPassing}
            isApplying={isApplying}
          />
        ))}
        <div className="h-4" />
      </div>
    </>
  );
}
