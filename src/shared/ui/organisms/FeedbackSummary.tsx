'use client';

import { cn } from '@/shared/utils/cn';

export interface FeedbackSummaryProps {
  likes: number;
  passes: number;
  saves: number;
  applies: number;
  className?: string;
}

export function FeedbackSummary({
  likes,
  passes,
  saves,
  applies,
  className,
}: FeedbackSummaryProps) {
  return (
    <div
      className={cn(
        'bg-background flex items-center justify-around rounded-xl border border-neutral-200 px-4 py-3',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-label-sm text-swipe-like font-semibold">{likes}</span>
        <span className="text-label-xs text-neutral-500">Likes</span>
      </div>
      <div className="h-8 w-px bg-neutral-200" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-label-sm text-swipe-pass font-semibold">{passes}</span>
        <span className="text-label-xs text-neutral-500">Passes</span>
      </div>
      <div className="h-8 w-px bg-neutral-200" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-label-sm text-swipe-like font-semibold">{saves}</span>
        <span className="text-label-xs text-neutral-500">Saved</span>
      </div>
      <div className="h-8 w-px bg-neutral-200" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-label-sm text-swipe-super font-semibold">{applies}</span>
        <span className="text-label-xs text-neutral-500">Applied</span>
      </div>
    </div>
  );
}
