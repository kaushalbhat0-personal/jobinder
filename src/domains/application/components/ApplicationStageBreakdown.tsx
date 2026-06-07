'use client';

import type { Application, ApplicationStage } from '../entities/application';
import { ApplicationStages } from '../entities/application';
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

interface ApplicationStageBreakdownProps {
  applications: Application[];
}

export function ApplicationStageBreakdown({ applications }: ApplicationStageBreakdownProps) {
  const counts = ApplicationStages.reduce(
    (acc, stage) => {
      acc[stage] = applications.filter((a) => a.stage === stage).length;
      return acc;
    },
    {} as Record<ApplicationStage, number>,
  );

  const total = applications.length;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h4 className="text-label-sm mb-3 font-semibold text-neutral-700">Pipeline Breakdown</h4>
      <div className="flex flex-wrap gap-2">
        {ApplicationStages.map((stage) => {
          const count = counts[stage];
          return (
            <div key={stage} className="flex items-center gap-1.5">
              <Badge variant={stageColors[stage]} size="sm">
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </Badge>
              <span className="text-caption text-neutral-600">
                {count}
                {total > 0 ? ` (${Math.round((count / total) * 100)}%)` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
