'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading, Text, Button, Input } from '@/shared/ui/atoms';
import { FormField } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';
import { CompleteOnboardingUseCase } from '@/domains/profile/use-cases/complete-onboarding.use-case';
import type { CareerStage } from '@/domains/profile/entities/user-profile';
import { track } from '@/shared/analytics/track';
import { getProfileRepository } from '@/shared/lib/repositories';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer',
  'UI/UX Designer',
  'Product Manager',
  'QA Engineer',
  'System Administrator',
];

const LOCATIONS = [
  'Remote',
  'Mumbai',
  'Bangalore',
  'Delhi/NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'International',
];

const STAGES: { value: CareerStage; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'fresher', label: 'Fresher' },
  { value: 'experienced', label: 'Experienced' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [careerStage, setCareerStage] = useState<CareerStage | null>(null);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (role: string) => {
    setTargetRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const toggleLocation = (loc: string) => {
    setPreferredLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return careerStage !== null;
      case 2:
        return targetRoles.length > 0;
      case 3:
        return preferredLocations.length > 0;
      case 4:
        return true;
      case 5:
        return name.trim().length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !careerStage) return;
    setSaving(true);
    setError(null);
    try {
      const result = await new CompleteOnboardingUseCase(getProfileRepository()).execute(user.id, {
        name: name.trim(),
        careerStage,
        targetRoles,
        preferredLocations,
        expectedSalaryMin: salaryMin ? Number(salaryMin) : null,
        expectedSalaryMax: salaryMax ? Number(salaryMax) : null,
      });
      if (result.isFailure()) {
        setError(result.error?.message ?? 'Failed to save profile');
        setSaving(false);
        return;
      }
      track('profile_updated', { userId: user.id, onboarding: 'completed' });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center p-4">
        <Text variant="body-md" className="text-neutral-500">
          Loading...
        </Text>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center p-4">
        <Text variant="body-md" className="text-neutral-500">
          Please sign in to continue.
        </Text>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col p-4">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
        <Text variant="caption" className="text-neutral-400">
          Step {step + 1} of 6
        </Text>
      </div>

      {error && (
        <Text variant="body-sm" className="text-danger-500 mb-4">
          {error}
        </Text>
      )}

      <div className="flex-1">
        {step === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Heading variant="heading-lg">Welcome to JOBinder!</Heading>
            <Text variant="body-md" className="max-w-sm text-neutral-500">
              Let&apos;s set up your profile so we can find the best opportunities for you. This
              will only take a minute.
            </Text>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Heading variant="heading-sm">What&apos;s your career stage?</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              This helps us tailor job recommendations for you.
            </Text>
            <div className="flex flex-col gap-3">
              {STAGES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setCareerStage(s.value)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    careerStage === s.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'bg-background border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Text variant="body-md" className="font-semibold">
                    {s.label}
                  </Text>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Heading variant="heading-sm">What roles are you targeting?</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              Select all that apply.
            </Text>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`text-body-sm rounded-full border-2 px-4 py-2 font-medium transition-all ${
                    targetRoles.includes(role)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'bg-background border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Heading variant="heading-sm">Where would you like to work?</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              Select your preferred locations.
            </Text>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocation(loc)}
                  className={`text-body-sm rounded-full border-2 px-4 py-2 font-medium transition-all ${
                    preferredLocations.includes(loc)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'bg-background border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <Heading variant="heading-sm">What&apos;s your expected salary?</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              Enter your expected salary range in INR per annum (optional).
            </Text>
            <div className="flex gap-3">
              <FormField label="Minimum" className="flex-1">
                <Input
                  type="number"
                  placeholder="e.g. 500000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  min={0}
                />
              </FormField>
              <FormField label="Maximum" className="flex-1">
                <Input
                  type="number"
                  placeholder="e.g. 1500000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  min={0}
                />
              </FormField>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <Heading variant="heading-sm">Almost done!</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              Tell us your name to complete your profile.
            </Text>
            <FormField
              label="Your Name"
              required
              error={name.trim() ? undefined : 'Name is required'}
            >
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <Text variant="body-sm" className="mb-2 font-semibold">
                Summary
              </Text>
              <div className="text-body-sm flex flex-col gap-1 text-neutral-600">
                <Text variant="body-sm">Stage: {careerStage}</Text>
                <Text variant="body-sm">Roles: {targetRoles.join(', ')}</Text>
                <Text variant="body-sm">Locations: {preferredLocations.join(', ')}</Text>
                <Text variant="body-sm">
                  Salary:{' '}
                  {salaryMin || salaryMax
                    ? `₹${Number(salaryMin || 0).toLocaleString()} - ₹${Number(salaryMax || 0).toLocaleString()}`
                    : 'Not specified'}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={saving}>
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step < 5 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={saving} disabled={!canProceed()}>
            Finish
          </Button>
        )}
      </div>
    </main>
  );
}
