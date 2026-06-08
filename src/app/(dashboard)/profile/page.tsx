'use client';

import { PageHeader, EmptyState } from '@/shared/ui/organisms';
import { Button } from '@/shared/ui/atoms';

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Manage your career profile and preferences" />
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
          title="Complete your profile"
          description="Add your skills, experience, and career preferences to get personalized job recommendations and better AI analysis."
          action={<Button variant="primary">Edit Profile</Button>}
        />
      </div>
    </>
  );
}
