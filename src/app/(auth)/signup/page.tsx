'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heading, Text, Button, Input } from '@/shared/ui/atoms';
import { Card, CardBody, FormField } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { signUp, user, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    console.log('[SIGNUP PAGE] Submit handler called', {
      email,
      name,
      passwordLength: password.length,
    });

    if (password !== confirmPassword) {
      console.log('[SIGNUP PAGE] Passwords do not match');
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.log('[SIGNUP PAGE] Password too short');
      setLocalError('Password must be at least 6 characters');
      return;
    }

    console.log('[SIGNUP PAGE] Calling signUp()');
    const result = await signUp(email, password, name);
    console.log('[SIGNUP PAGE] signUp() returned:', result);
    if (result) {
      // If user is authenticated after signUp, redirect immediately
      // Otherwise, show email confirmation message
      if (user) {
        console.log('[SIGNUP PAGE] User authenticated, redirecting to /onboarding');
        window.location.href = '/onboarding';
      } else {
        console.log('[SIGNUP PAGE] User not authenticated, showing email confirmation message');
        setEmailSent(true);
      }
    }
  };

  const displayError = localError || error;

  if (emailSent) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Heading variant="heading-lg">Check Your Email</Heading>
          <Text variant="body-md" className="text-neutral-500">
            We sent a confirmation link to <strong>{email}</strong>
          </Text>
        </div>
        <Card className="w-full">
          <CardBody className="flex flex-col gap-4 text-center">
            <Text variant="body-sm" className="text-neutral-500">
              Click the link in the email to verify your account and complete your registration.
            </Text>
            <Link href="/login" className="text-center">
              <Text variant="body-sm" className="text-primary-500 hover:underline">
                Return to sign in
              </Text>
            </Link>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Heading variant="heading-lg">Create Account</Heading>
        <Text variant="body-md" className="text-neutral-500">
          Join JOBinder to accelerate your career
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
            <FormField label="Full Name" required error={undefined}>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </FormField>
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
            <FormField label="Password" required error={undefined}>
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
            <FormField label="Confirm Password" required error={undefined}>
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
              Create Account
            </Button>
          </form>

          <Link href="/login" className="text-center">
            <Text variant="body-sm" className="text-neutral-500">
              Already have an account?{' '}
              <span className="text-primary-500 hover:underline">Sign in</span>
            </Text>
          </Link>
        </CardBody>
      </Card>
    </main>
  );
}
