'use client';

import { PageHeader, EmptyState } from '@/shared/ui/organisms';
import { Button } from '@/shared/ui/atoms';

export default function FeedPage() {
  return (
    <>
      <PageHeader title="Job Feed" description="Discover opportunities matched to your profile" />
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
          description="Complete your onboarding and upload your resume to receive personalized job recommendations."
          action={<Button variant="primary">Complete Onboarding</Button>}
        />
      </div>
    </>
  );
}
