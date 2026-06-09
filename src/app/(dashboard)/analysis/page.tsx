'use client';

import { useState, Suspense, use, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, LoadingState } from '@/shared/ui/organisms';
import { Heading, Text, Button, Badge, ProgressBar } from '@/shared/ui/atoms';
import { Card, CardBody } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';
import { SupabaseResumeStorageService } from '@/domains/resume/services/supabase-resume-storage.service';
import { DeepSeekAdapter } from '@/domains/ai/providers/deepseek.adapter';
import { ResumeAIService } from '@/domains/ai/services/resume-ai.service';
import { AnalyzeResumeUseCase } from '@/domains/ai/use-cases/analyze-resume.use-case';
import type { AnalysisOutput } from '@/domains/ai/services/resume-ai.service';

const storage = new SupabaseResumeStorageService();
const provider = new DeepSeekAdapter();
const aiService = new ResumeAIService(provider);
const analyzeUseCase = new AnalyzeResumeUseCase(storage, aiService);

function AtsScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  let variant: 'success' | 'warning' | 'danger' = 'danger';
  if (clamped >= 80) variant = 'success';
  else if (clamped >= 60) variant = 'warning';

  const colorMap = {
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-neutral-200"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - clamped / 100)}`}
            className={`transition-all duration-700 ease-out ${colorMap[variant]}`}
          />
        </svg>
        <span className={`text-display-md text-foreground font-bold ${colorMap[variant]}`}>
          {clamped}
        </span>
      </div>
      <Text variant="body-sm" className="text-neutral-500">
        ATS Score
      </Text>
    </div>
  );
}

function AnalysisContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<AnalysisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPromise = useMemo(
    () => (user ? storage.retrieveProfileSnapshot(user.id) : Promise.resolve(null)),
    [user],
  );
  const loadResult = use(loadPromise);
  const snapshot = loadResult?.isSuccess() ? loadResult.value : null;

  const handleAnalyze = useCallback(async () => {
    if (!user || !snapshot) return;
    setLoading(true);
    setError(null);

    const result = await analyzeUseCase.execute(user.id, 'latest');
    if (result.isFailure()) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setAnalysis(result.value);
    setLoading(false);
  }, [user, snapshot]);

  const autoTriggered = useRef(false);

  useEffect(() => {
    if (
      snapshot &&
      searchParams.get('auto') === 'true' &&
      !analysis &&
      !loading &&
      !error &&
      !autoTriggered.current
    ) {
      autoTriggered.current = true;
      setTimeout(() => handleAnalyze(), 0);
    }
  }, [snapshot, searchParams, handleAnalyze, analysis, loading, error]);

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Text variant="body-md" className="text-neutral-500">
          Sign in to view your resume analysis.
        </Text>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Text variant="body-md" className="text-neutral-500">
          No resume data found. Upload and confirm a resume first.
        </Text>
        <Button onClick={() => (window.location.href = '/upload')}>Upload Resume</Button>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Analyzing your resume..." />;
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Text variant="body-md" className="text-danger-500">
          {error}
        </Text>
        <Button variant="outline" onClick={handleAnalyze}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Text variant="body-md" className="text-neutral-500">
          Ready to analyze your resume.
        </Text>
        <Button size="lg" onClick={handleAnalyze}>
          Run Analysis
        </Button>
      </div>
    );
  }

  const { result } = analysis;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardBody className="flex flex-col items-center gap-4">
          <AtsScoreRing score={result.atsScore} />
          <Text variant="body-md" className="text-center text-neutral-600">
            {result.summary}
          </Text>
          <ProgressBar
            value={result.atsScore}
            variant={result.atsScore >= 80 ? 'success' : 'primary'}
            showLabel
            className="w-full"
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <Heading variant="heading-sm">Strengths</Heading>
          {result.strengths.length === 0 ? (
            <Text variant="body-sm" className="text-neutral-400">
              No strengths identified.
            </Text>
          ) : (
            <ul className="flex flex-col gap-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-body-sm flex items-start gap-2 text-neutral-700">
                  <span className="text-success-500 mt-0.5">&bull;</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <Heading variant="heading-sm">Weaknesses</Heading>
          {result.weaknesses.length === 0 ? (
            <Text variant="body-sm" className="text-neutral-400">
              No weaknesses identified.
            </Text>
          ) : (
            <ul className="flex flex-col gap-2">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="text-body-sm flex items-start gap-2 text-neutral-700">
                  <span className="text-danger-500 mt-0.5">&bull;</span>
                  {w}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <Heading variant="heading-sm">Missing Skills</Heading>
          {result.missingSkills.length === 0 ? (
            <Text variant="body-sm" className="text-neutral-400">
              No critical missing skills.
            </Text>
          ) : (
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.map((skill, i) => (
                <Badge key={i} variant="warning">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <Heading variant="heading-sm">Suggested Roles</Heading>
          {result.suggestedRoles.length === 0 ? (
            <Text variant="body-sm" className="text-neutral-400">
              No suggested roles.
            </Text>
          ) : (
            <div className="flex flex-wrap gap-2">
              {result.suggestedRoles.map((role, i) => (
                <Badge key={i} variant="info">
                  {role}
                </Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <Heading variant="heading-sm">Recommendations</Heading>
          {result.recommendations.length === 0 ? (
            <Text variant="body-sm" className="text-neutral-400">
              No recommendations.
            </Text>
          ) : (
            <ol className="flex flex-col gap-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-body-sm flex items-start gap-3 text-neutral-700">
                  <span className="bg-primary-100 text-caption text-primary-700 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-semibold">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>

      <div className="flex-1" />

      <Button fullWidth size="lg" variant="outline" onClick={handleAnalyze} loading={loading}>
        Re-analyze
      </Button>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <>
      <PageHeader title="Resume Analysis" description="AI-powered insights on your resume" />
      <Suspense fallback={<LoadingState message="Loading analysis..." />}>
        <AnalysisContent />
      </Suspense>
    </>
  );
}
