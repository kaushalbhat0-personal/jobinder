'use client';

import { useEffect, useState } from 'react';
import { Heading, Text } from '@/shared/ui/atoms';
import { Card, CardBody } from '@/shared/ui/molecules';

interface Metrics {
  users: number;
  resumes: number;
  analyses: number;
  applications: number;
  feedback: number;
  feeds: number;
}

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(setMetrics)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Text variant="body-md" className="text-red-500">
          {error}
        </Text>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Text variant="body-md">Loading...</Text>
      </div>
    );
  }

  const rows: Array<{ label: string; value: number }> = [
    { label: 'Users', value: metrics.users },
    { label: 'Resumes Uploaded', value: metrics.resumes },
    { label: 'Analyses Completed', value: metrics.analyses },
    { label: 'Applications Created', value: metrics.applications },
    { label: 'Feedback Entries', value: metrics.feedback },
    { label: 'Feed Generations', value: metrics.feeds },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Heading variant="heading-lg">Admin / Metrics</Heading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <Card key={row.label}>
            <CardBody className="flex flex-col gap-1">
              <Text variant="caption" className="tracking-wide text-neutral-500 uppercase">
                {row.label}
              </Text>
              <Heading variant="heading-lg" className="font-bold">
                {row.value.toLocaleString()}
              </Heading>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
