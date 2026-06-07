'use client';

import { useState, Suspense, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/shared/ui/organisms';
import { Heading, Text, Button, Input, Textarea } from '@/shared/ui/atoms';
import { Card, CardBody, FormField } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';
import { InMemoryResumeStorageService } from '@/domains/resume/services/resume-storage.service';
import type { ParsedResumeData } from '@/domains/resume/contracts/resume-parser.contract';
import { emitProfileEvent } from '@/domains/profile/events/profile-events';
import { track } from '@/shared/analytics/track';

const storage = new InMemoryResumeStorageService();

const emptyData: ParsedResumeData = {
  name: null,
  email: null,
  phone: null,
  experience: 0,
  skills: [],
  education: [],
  rawText: '',
};

function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPromise = useMemo(
    () => (resumeId ? storage.retrieveParsedData(resumeId) : Promise.resolve(null)),
    [resumeId],
  );
  const loadResult = use(loadPromise);
  const initialData = loadResult?.isSuccess() ? loadResult.value : null;

  const [data, setData] = useState<ParsedResumeData>(initialData ?? emptyData);
  const [skillInput, setSkillInput] = useState('');
  const [editEducation, setEditEducation] = useState<ParsedResumeData['education']>(
    initialData?.education ?? [],
  );

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      setData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addEducation = () => {
    setEditEducation((prev) => [...prev, { degree: '', institution: '', year: null }]);
  };

  const updateEducation = (index: number, field: string, value: string | number | null) => {
    setEditEducation((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const removeEducation = (index: number) => {
    setEditEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!user || !resumeId) return;
    setSaving(true);
    setError(null);

    const confirmed: ParsedResumeData = {
      ...data,
      education: editEducation.filter((e) => e.degree || e.institution),
    };

    const storeResult = await storage.storeParsedData(resumeId, confirmed);
    if (storeResult.isFailure()) {
      setError(storeResult.error?.message ?? 'Failed to save');
      setSaving(false);
      return;
    }

    const snapshotResult = await storage.storeProfileSnapshot(user.id, confirmed);
    if (snapshotResult.isFailure()) {
      setError(snapshotResult.error?.message ?? 'Failed to save profile snapshot');
      setSaving(false);
      return;
    }

    try {
      emitProfileEvent('profile:updated', {
        userId: user.id,
        updatedFields: ['name', 'email', 'skills', 'experience'],
      });
    } catch {
      /* event emission is non-critical */
    }

    try {
      track('profile_updated', { userId: user.id, source: 'resume-review' });
    } catch {
      /* analytics is non-critical */
    }

    router.push('/dashboard');
  };

  if (!resumeId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Text variant="body-md" className="text-neutral-500">
          No resume selected.
        </Text>
        <Button onClick={() => router.push('/upload')}>Upload a resume</Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Review Resume"
        action={
          <Button variant="ghost" size="sm" onClick={() => router.push('/upload')}>
            Re-upload
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {error && (
          <Text variant="body-sm" className="text-danger-500">
            {error}
          </Text>
        )}

        <Card>
          <CardBody className="flex flex-col gap-3">
            <Heading variant="heading-sm">Personal Information</Heading>
            <FormField label="Full Name">
              <Input
                value={data.name ?? ''}
                onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value || null }))}
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={data.email ?? ''}
                onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value || null }))}
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={data.phone ?? ''}
                onChange={(e) => setData((prev) => ({ ...prev, phone: e.target.value || null }))}
              />
            </FormField>
            <FormField label="Years of Experience">
              <Input
                type="number"
                min={0}
                value={data.experience}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, experience: Math.max(0, Number(e.target.value)) }))
                }
              />
            </FormField>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3">
            <Heading variant="heading-sm">Skills</Heading>
            <div className="flex flex-wrap gap-2">
              {data.skills.length === 0 && (
                <Text variant="body-sm" className="text-neutral-400">
                  No skills detected. Add some below.
                </Text>
              )}
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary-50 text-body-sm text-primary-700 inline-flex items-center gap-1 rounded-full px-3 py-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={addSkill}>
                Add
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3">
            <Heading variant="heading-sm">Education</Heading>
            {editEducation.length === 0 && (
              <Text variant="body-sm" className="text-neutral-400">
                No education entries detected. Add some below.
              </Text>
            )}
            {editEducation.map((edu, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3">
                <div className="flex justify-between">
                  <Text variant="body-sm" className="font-semibold">
                    Entry {i + 1}
                  </Text>
                  <button
                    type="button"
                    onClick={() => removeEducation(i)}
                    className="text-body-sm text-danger-500"
                  >
                    Remove
                  </button>
                </div>
                <FormField label="Degree">
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                  />
                </FormField>
                <FormField label="Institution">
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                  />
                </FormField>
                <FormField label="Year">
                  <Input
                    type="number"
                    min={1950}
                    max={2030}
                    value={edu.year ?? ''}
                    onChange={(e) =>
                      updateEducation(i, 'year', e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </FormField>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEducation}>
              Add Education
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3">
            <Heading variant="heading-sm">Experience</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              Review the extracted resume content below. Edit as needed.
            </Text>
            <Textarea
              value={data.rawText}
              onChange={(e) => setData((prev) => ({ ...prev, rawText: e.target.value }))}
              rows={10}
              className="min-h-[200px]"
            />
          </CardBody>
        </Card>

        <div className="flex-1" />

        <Button fullWidth size="lg" onClick={handleConfirm} loading={saving}>
          Confirm & Save
        </Button>
      </div>
    </>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-4">Loading review...</div>
      }
    >
      <ReviewForm />
    </Suspense>
  );
}
