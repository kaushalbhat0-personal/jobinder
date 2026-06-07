'use client';

import { PageHeader } from '@/shared/ui/organisms';
import { Heading, Text, Button } from '@/shared/ui/atoms';
import { Card, CardBody } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';
import { useProfileStore } from '@/domains/profile/stores/profile-store';

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
          <CardBody className="flex flex-col gap-2">
            <Heading variant="heading-sm">Welcome, {user?.name ?? 'User'}!</Heading>
            <Text variant="body-md" className="text-neutral-500">
              Your career dashboard is ready.
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-2">
            <Heading variant="heading-sm">Profile Summary</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              {profile
                ? `${profile.name} | ${profile.careerStage ?? 'Stage not set'} | ${profile.targetRoles.join(', ') || 'No roles set'}`
                : 'Complete your profile to get started.'}
            </Text>
          </CardBody>
        </Card>

        <div className="flex-1" />

        <Text variant="caption" className="text-center text-neutral-400">
          JOBinder v1.0
        </Text>
      </div>
    </>
  );
}
