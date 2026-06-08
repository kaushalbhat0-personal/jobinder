'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/shared/ui/organisms';
import { Heading, Text, Button, Badge } from '@/shared/ui/atoms';
import { Card, CardBody, CardFooter } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';
import { useProfileStore } from '@/domains/profile/stores/profile-store';

interface DashboardCardProps {
  title: string;
  description: string;
  status: 'ready' | 'pending' | 'empty';
  statusLabel: string;
  actionLabel: string;
  actionHref: string;
  icon: React.ReactNode;
}

function DashboardCard({
  title,
  description,
  status,
  statusLabel,
  actionLabel,
  actionHref,
  icon,
}: DashboardCardProps) {
  const router = useRouter();
  const variantMap = { ready: 'success', pending: 'warning', empty: 'default' } as const;
  const badgeVariant = variantMap[status] as 'success' | 'warning' | 'default';

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
              {icon}
            </div>
            <div className="flex-1">
              <Heading variant="heading-sm">{title}</Heading>
              <Text variant="body-sm" className="mt-0.5 text-neutral-500">
                {description}
              </Text>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={badgeVariant}>{statusLabel}</Badge>
        </div>
      </CardBody>
      <CardFooter>
        <Button
          variant={status === 'empty' ? 'primary' : 'outline'}
          size="sm"
          fullWidth
          onClick={() => router.push(actionHref)}
        >
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth();
  const profile = useProfileStore((s) => s.profile);

  return (
    <>
      <PageHeader
        title="Dashboard"
        action={
          <Button variant="ghost" size="sm" onClick={signOut} loading={isLoading}>
            Sign Out
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardBody className="flex flex-col gap-1">
            <Heading variant="heading-md">Welcome, {user?.name ?? 'User'}!</Heading>
            <Text variant="body-md" className="text-neutral-500">
              {profile
                ? `${profile.name} | ${profile.careerStage ?? 'Stage not set'}`
                : 'Complete your profile to get started.'}
            </Text>
          </CardBody>
        </Card>

        <DashboardCard
          title="Resume"
          description="Upload and analyze your resume"
          status="empty"
          statusLabel="Not uploaded"
          actionLabel="Upload Resume"
          actionHref="/resume"
          icon={
            <svg
              className="h-5 w-5"
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
        />

        <DashboardCard
          title="AI Analysis"
          description="ATS scoring and resume feedback"
          status="pending"
          statusLabel="Upload resume first"
          actionLabel="Analyze Resume"
          actionHref="/analysis"
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          }
        />

        <DashboardCard
          title="Job Feed"
          description="Discover opportunities matched to you"
          status="pending"
          statusLabel="Setup required"
          actionLabel="View Jobs"
          actionHref="/feed"
          icon={
            <svg
              className="h-5 w-5"
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
        />

        <DashboardCard
          title="Applications"
          description="Track your job applications"
          status="empty"
          statusLabel="No applications"
          actionLabel="Track Applications"
          actionHref="/applications"
          icon={
            <svg
              className="h-5 w-5"
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
        />

        <div className="flex-1" />
      </div>
    </>
  );
}
