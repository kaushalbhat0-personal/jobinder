'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heading, Text, Button, Input } from '@/shared/ui/atoms';
import { Card, CardBody, FormField } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { updatePassword, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const result = await updatePassword(password);
    if (result) {
      setSuccess(true);
    }
  };

  const displayError = localError || error;

  if (success) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Heading variant="heading-lg">Password Updated</Heading>
          <Text variant="body-md" className="text-neutral-500">
            Your password has been successfully reset.
          </Text>
        </div>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Heading variant="heading-lg">Set New Password</Heading>
        <Text variant="body-md" className="text-neutral-500">
          Enter your new password below
        </Text>
      </div>

      <Card className="w-full">
        <CardBody className="flex flex-col gap-4">
          {displayError && (
            <Text variant="body-sm" className="text-danger-500">
              {displayError}
            </Text>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <FormField label="New Password" required error={undefined}>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </FormField>
            <FormField label="Confirm New Password" required error={undefined}>
              <Input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </FormField>
            <Button type="submit" fullWidth loading={isLoading}>
              Update Password
            </Button>
          </form>

          <Link href="/login" className="text-center">
            <Text variant="body-sm" className="text-primary-500 hover:underline">
              Back to sign in
            </Text>
          </Link>
        </CardBody>
      </Card>
    </main>
  );
}
