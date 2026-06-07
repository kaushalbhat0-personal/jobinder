'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heading, Text, Button, Input } from '@/shared/ui/atoms';
import { Card, CardBody, FormField } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await resetPassword(email);
    if (result) {
      setSent(true);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Heading variant="heading-lg">Reset Password</Heading>
        <Text variant="body-md" className="text-neutral-500">
          We&apos;ll send you a link to reset your password
        </Text>
      </div>

      <Card className="w-full">
        <CardBody className="flex flex-col gap-4">
          {error && (
            <Text variant="body-sm" className="text-danger-500">
              {error}
            </Text>
          )}

          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <FormField label="Email" required error={undefined}>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </FormField>
              <Button type="submit" fullWidth loading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-3 text-center">
              <Text variant="body-md" className="text-success-600">
                Check your email
              </Text>
              <Text variant="body-sm" className="text-neutral-500">
                We sent a password reset link to <strong>{email}</strong>.
              </Text>
              <Button variant="ghost" fullWidth onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </div>
          )}

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
