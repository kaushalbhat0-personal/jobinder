'use client';

import { useCallback } from 'react';
import { Card, CardBody, CardFooter } from '@/shared/ui/molecules';
import { Heading, Text, Badge, Button } from '@/shared/ui/atoms';
import { cn } from '@/shared/utils/cn';
import type { Job } from '../entities/job';

interface JobCardProps {
  job: Job;
  matchScore: number;
  matchReasons: string[];
  onSave?: (jobId: string) => void;
  onPass?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaving?: boolean;
  isPassing?: boolean;
  isApplying?: boolean;
  className?: string;
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

function ScoreBadge({ score }: { score: number }) {
  let variant: 'success' | 'warning' | 'danger' = 'danger';
  if (score >= 80) variant = 'success';
  else if (score >= 60) variant = 'warning';

  return <Badge variant={variant}>{score}% Match</Badge>;
}

export function JobCard({
  job,
  matchScore,
  matchReasons,
  onSave,
  onPass,
  onApply,
  isSaving,
  isPassing,
  isApplying,
  className,
}: JobCardProps) {
  const handleSave = useCallback(() => onSave?.(job.id), [onSave, job.id]);
  const handlePass = useCallback(() => onPass?.(job.id), [onPass, job.id]);
  const handleApply = useCallback(() => onApply?.(job.id), [onApply, job.id]);

  return (
    <Card className={cn('', className)}>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Heading variant="heading-sm" as="h3" className="line-clamp-2">
              {job.title}
            </Heading>
            <Text variant="body-sm" className="mt-0.5 text-neutral-600">
              {job.company}
            </Text>
          </div>
          <ScoreBadge score={matchScore} />
        </div>

        {matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {matchReasons.map((reason, i) => (
              <Badge key={i} variant="info" size="sm">
                {reason}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="default" size="sm">
            {job.type?.replace('-', ' ')}
          </Badge>
          {job.location && (
            <Badge variant="default" size="sm">
              {job.location}
            </Badge>
          )}
          <Badge variant="default" size="sm">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
          </Badge>
        </div>

        {job.description && (
          <Text variant="body-sm" className="line-clamp-3 text-neutral-500">
            {job.description}
          </Text>
        )}

        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="default" size="sm">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="default" size="sm">
                +{job.skills.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardBody>
      <CardFooter className="gap-2">
        {onPass && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handlePass}
            loading={isPassing}
            className="border-neutral-300 text-neutral-600"
          >
            Pass
          </Button>
        )}
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleSave}
            loading={isSaving}
            className="border-neutral-300 text-neutral-600"
          >
            Save
          </Button>
        )}
        {onApply && (
          <Button variant="primary" size="sm" fullWidth onClick={handleApply} loading={isApplying}>
            Apply
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
