'use client';

import type { Job } from '../entities/job';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Text } from '@/shared/ui/atoms/Text';
import { Heading } from '@/shared/ui/atoms/Heading';
import { cn } from '@/shared/utils/cn';

interface JobSwipeCardProps {
  job: Job;
  onSave?: () => void;
}

const currencySymbol: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

function formatSalary(min: number | null, max: number | null, currency: string): string {
  const sym = currencySymbol[currency] ?? currency;
  if (min != null && max != null)
    return `${sym}${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (min != null) return `From ${sym}${(min / 1000).toFixed(0)}k`;
  if (max != null) return `Up to ${sym}${(max / 1000).toFixed(0)}k`;
  return 'Salary not disclosed';
}

export function JobSwipeCard({ job, onSave }: JobSwipeCardProps) {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Heading variant="heading-md" as="h3" className="line-clamp-2 text-neutral-900">
            {job.title}
          </Heading>
          <Text className="mt-1 text-neutral-600">{job.company}</Text>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="default">{job.type?.replace('-', ' ')}</Badge>
        {job.location && <Badge variant="default">{job.location}</Badge>}
        <Badge variant="default">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</Badge>
      </div>

      {job.description && (
        <Text className="mt-4 line-clamp-4 text-neutral-600">{job.description}</Text>
      )}

      <div className="mt-4">
        <Text className="text-label-sm mb-2 font-semibold text-neutral-700">Skills</Text>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 6).map((skill) => (
            <Badge key={skill} variant="info" size="sm">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 6 && (
            <Badge variant="default" size="sm">
              +{job.skills.length - 6}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="text-label-xs text-neutral-400">Exp: {job.experienceRequired}+ yrs</div>
        {onSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className={cn(
              'bg-background text-label-sm rounded-lg border border-neutral-300 px-4 py-1.5 font-medium text-neutral-700',
              'hover:border-swipe-like hover:text-swipe-like transition-colors',
            )}
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
