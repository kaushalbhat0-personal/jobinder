'use client';

import type { Application } from '../entities/application';
import { ApplicationCard } from './ApplicationCard';
import { ApplicationStageBreakdown } from './ApplicationStageBreakdown';
import { Heading } from '@/shared/ui/atoms/Heading';
import { Text } from '@/shared/ui/atoms/Text';

interface ApplicationDashboardProps {
  applications: Application[];
  title?: string;
}

export function ApplicationDashboard({
  applications,
  title = 'My Applications',
}: ApplicationDashboardProps) {
  const active = applications.filter((a) => a.isActive());
  const interviews = applications.filter((a) => a.isInterview());
  const offers = applications.filter((a) => a.stage === 'offer');

  const conversionRate =
    applications.length > 0 ? Math.round((offers.length / applications.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Heading variant="heading-lg">{title}</Heading>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <Text variant="body-lg" className="text-neutral-900">
            {applications.length}
          </Text>
          <Text variant="body-sm" className="text-neutral-500">
            Applications
          </Text>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <Text variant="body-lg" className="text-neutral-900">
            {interviews.length}
          </Text>
          <Text variant="body-sm" className="text-neutral-500">
            Interviews
          </Text>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <Text variant="body-lg" className="text-neutral-900">
            {offers.length}
          </Text>
          <Text variant="body-sm" className="text-neutral-500">
            Offers
          </Text>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <Text variant="body-lg" className="text-neutral-900">
            {conversionRate}%
          </Text>
          <Text variant="body-sm" className="text-neutral-500">
            Conversion
          </Text>
        </div>
      </div>

      <ApplicationStageBreakdown applications={applications} />

      <div className="space-y-3">
        <Heading variant="heading-md">Active Applications</Heading>
        {active.length === 0 ? (
          <Text className="text-neutral-500">No applications yet. Start applying to jobs!</Text>
        ) : (
          active.map((app) => <ApplicationCard key={app.id} application={app} />)
        )}
      </div>
    </div>
  );
}
