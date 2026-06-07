'use client';

import type { Application, ApplicationStage } from '../entities/application';
import { Text } from '@/shared/ui/atoms/Text';
import { Badge } from '@/shared/ui/atoms/Badge';

const stageColors: Record<ApplicationStage, 'default' | 'success' | 'warning' | 'danger' | 'info'> =
  {
    saved: 'default',
    applied: 'info',
    screening: 'warning',
    interview: 'info',
    technical: 'warning',
    final: 'warning',
    offer: 'success',
    rejected: 'danger',
    withdrawn: 'default',
  };

const stageLabels: Record<ApplicationStage, string> = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  technical: 'Technical',
  final: 'Final',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const appliedDate = application.appliedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const lastUpdated = application.lastUpdated.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Text className="font-semibold text-neutral-900">{application.role}</Text>
          <Text className="mt-0.5 text-neutral-600">{application.company}</Text>
        </div>
        <Badge variant={stageColors[application.stage]}>{stageLabels[application.stage]}</Badge>
      </div>
      <div className="text-caption mt-3 flex gap-4 text-neutral-500">
        <span>Applied: {appliedDate}</span>
        <span>Updated: {lastUpdated}</span>
      </div>
    </div>
  );
}
