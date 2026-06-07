'use client';

import { useState } from 'react';
import { Heading, Text, Button, Input } from '@/shared/ui/atoms';
import { Card, CardBody, FormField } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';

const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';

export default function LoginPage() {
  const [mode, setMode] = useState<'oauth' | 'otp'>(googleAuthEnabled ? 'oauth' : 'otp');
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { signInWithGoogle, signInWithOtp, verifyOtp, isLoading, error } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithOtp(email);
    setOtpSent(true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtp(email, otpToken);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Heading variant="heading-lg">JOBinder</Heading>
        <Text variant="body-md" className="text-neutral-500">
          Sign in to your career platform
        </Text>
      </div>

      <Card className="w-full">
        <CardBody className="flex flex-col gap-4">
          {error && (
            <Text variant="body-sm" className="text-danger-500">
              {error}
            </Text>
          )}

          {googleAuthEnabled && (
            <>
              <Button variant="outline" fullWidth disabled={isLoading} onClick={signInWithGoogle}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-200" />
                <Text variant="body-sm" className="text-neutral-400">
                  or
                </Text>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>
            </>
          )}

          {mode === 'oauth' && googleAuthEnabled ? (
            <Button variant="ghost" fullWidth onClick={() => setMode('otp')}>
              Sign in with Email OTP
            </Button>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
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
                Send OTP
              </Button>
              {googleAuthEnabled && (
                <Button variant="ghost" fullWidth onClick={() => setMode('oauth')}>
                  Back to Google Sign In
                </Button>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
              <Text variant="body-sm" className="text-neutral-500">
                Enter the verification code sent to {email}
              </Text>
              <FormField label="Verification Code" required error={undefined}>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
              </FormField>
              <Button type="submit" fullWidth loading={isLoading}>
                Verify & Sign In
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setOtpSent(false)}>
                Change Email
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
