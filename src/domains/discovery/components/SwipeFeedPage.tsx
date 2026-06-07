'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Job } from '../entities/job';
import type { SwipeSession, SwipeDirection } from '../entities/swipe-session';
import { SwipeStack, FeedbackSummary } from '@/shared/ui/organisms';
import type { Direction } from '@/shared/ui/organisms/SwipeStack';
import { JobSwipeCard } from './JobSwipeCard';
import { EmptyState } from '@/shared/ui/organisms/EmptyState';
import { Button } from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/utils/cn';

interface SwipeFeedPageProps {
  jobs: Job[];
  session: SwipeSession | null;
  onSwipe: (jobId: string, direction: SwipeDirection, score: number | null) => void;
  onUndo: () => void;
  className?: string;
}

function directionFromSwipe(dir: Direction): SwipeDirection {
  if (dir === 'up') return 'up';
  if (dir === 'right') return 'right';
  return 'left';
}

export function SwipeFeedPage({ jobs, session, onSwipe, onUndo, className }: SwipeFeedPageProps) {
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  const handleSwipe = useCallback(
    (id: string, direction: Direction) => {
      setSwipedIds((prev) => new Set(prev).add(id));
      onSwipe(id, directionFromSwipe(direction), null);
    },
    [onSwipe],
  );

  const handleSave = useCallback(
    (id: string) => {
      setSwipedIds((prev) => new Set(prev).add(id));
      onSwipe(id, 'save', null);
    },
    [onSwipe],
  );

  const handleUndo = useCallback(() => {
    const lastSwiped = [...swipedIds].pop();
    if (lastSwiped) {
      const next = new Set(swipedIds);
      next.delete(lastSwiped);
      setSwipedIds(next);
      onUndo();
    }
  }, [swipedIds, onUndo]);

  const cards = useMemo(
    () =>
      jobs
        .filter((job) => !swipedIds.has(job.id))
        .map((job) => ({
          id: job.id,
          content: <JobSwipeCard job={job} onSave={() => handleSave(job.id)} />,
        })),
    [jobs, swipedIds, handleSave],
  );

  const likes = session?.getLikeCount() ?? 0;
  const passes = session?.getPassCount() ?? 0;
  const saves = session?.getSaveCount() ?? 0;
  const applies = session?.getApplyCount() ?? 0;
  const hasUndo = swipedIds.size > 0;

  if (cards.length === 0 && jobs.length > 0) {
    return (
      <div className={cn('flex flex-col items-center gap-6 px-4 py-12', className)}>
        <EmptyState
          icon="sparkles"
          title="You're all caught up!"
          description="Check back later for new job matches."
        />
        <Button variant="primary" onClick={() => setSwipedIds(new Set())}>
          Reset Feed
        </Button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className={cn('flex flex-col items-center gap-6 px-4 py-12', className)}>
        <EmptyState
          icon="search"
          title="No jobs yet"
          description="Upload your resume and generate a feed to get started."
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 px-4 py-4', className)}>
      <FeedbackSummary likes={likes} passes={passes} saves={saves} applies={applies} />

      <SwipeStack cards={cards} onSwipe={handleSwipe} onSave={handleSave} />

      {hasUndo && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleUndo}
            className={cn(
              'bg-background text-label-sm rounded-full border border-neutral-300 px-6 py-2 font-medium text-neutral-600',
              'transition-colors hover:border-neutral-400 hover:text-neutral-800',
            )}
          >
            Undo Last
          </button>
        </div>
      )}
    </div>
  );
}
