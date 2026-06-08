'use client';

import { PageHeader, EmptyState } from '@/shared/ui/organisms';
import { Button } from '@/shared/ui/atoms';

export default function ResumePage() {
  return (
    <>
      <PageHeader title="Resume" description="Manage your resume and review analysis" />
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
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"
              />
            </svg>
          }
          title="Upload your resume to get started"
          description="Upload your resume for AI-powered analysis, ATS scoring, and actionable feedback to improve your job applications."
          action={<Button variant="primary">Upload Resume</Button>}
        />
      </div>
    </>
  );
}
