'use client';

import { PageHeader, EmptyState } from '@/shared/ui/organisms';
import { Button } from '@/shared/ui/atoms';

export default function ApplicationsPage() {
  return (
    <>
      <PageHeader title="Applications" description="Track your job applications and progress" />
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
              <rect
                x="2"
                y="7"
                width="20"
                height="14"
                rx="2"
                ry="2"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"
              />
            </svg>
          }
          title="No applications tracked yet"
          description="Start exploring jobs and track your applications here to stay organized throughout your job search."
          action={<Button variant="primary">Browse Jobs</Button>}
        />
      </div>
    </>
  );
}
