import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { NotFoundError, UnauthorizedError } from '@/shared/core/errors';
import { ResumeAIService, type AnalysisOutput } from '../services/resume-ai.service';
import type { ResumeStorageContract } from '@/domains/resume/contracts/resume-storage.contract';
import { emitResumeEvent } from '@/domains/resume/events/resume-events';
import { emitAIEvent } from '@/domains/ai/events/ai-events';
import { track } from '@/shared/analytics/track';
import { checkAIRateLimit } from '@/shared/security/ai-rate-limit';
import { reportRateLimitHit } from '@/shared/monitoring/sentry';

export class AnalyzeResumeUseCase {
  constructor(
    private readonly storage: ResumeStorageContract,
    private readonly aiService: ResumeAIService,
  ) {}

  async execute(
    userId: string,
    resumeId: string,
    isPremium = false,
  ): Promise<Result<AnalysisOutput>> {
    const rateCheck = checkAIRateLimit(userId, 'resume_analysis', isPremium);
    if (!rateCheck.allowed) {
      reportRateLimitHit(userId, 'resume_analysis');
      return failure(
        new UnauthorizedError(
          'Daily analysis limit reached. Upgrade to premium for unlimited access.',
        ),
      );
    }

    const snapshotResult = await this.storage.retrieveProfileSnapshot(userId);
    if (snapshotResult.isFailure()) {
      return failure(snapshotResult.error);
    }

    const snapshot = snapshotResult.value;
    if (!snapshot) {
      return failure(
        new NotFoundError('No profile snapshot found. Please upload and confirm a resume first.'),
      );
    }

    const snapshotVersion = 1;

    try {
      emitResumeEvent('resume:analysis-started', { userId, resumeId, snapshotVersion });
    } catch {
      /* non-critical */
    }

    try {
      track('resume_analysis_started', { userId, resumeId });
    } catch {
      /* non-critical */
    }

    const analysisResult = await this.aiService.analyze({
      rawText: snapshot.rawText,
      skills: snapshot.skills,
      experience: snapshot.experience,
      education: snapshot.education,
    });

    if (analysisResult.isFailure()) {
      try {
        emitResumeEvent('resume:analysis-failed', {
          userId,
          resumeId,
          snapshotVersion,
          error: analysisResult.error.message,
        });
      } catch {
        /* non-critical */
      }

      try {
        track('resume_analysis_failed', { userId, resumeId, error: analysisResult.error.message });
      } catch {
        /* non-critical */
      }

      return failure(analysisResult.error);
    }

    try {
      emitResumeEvent('resume:analysis-completed', {
        userId,
        resumeId,
        snapshotVersion,
        score: analysisResult.value.result.atsScore,
      });
    } catch {
      /* non-critical */
    }

    try {
      track('resume_analysis_completed', {
        userId,
        resumeId,
        score: analysisResult.value.result.atsScore,
      });
    } catch {
      /* non-critical */
    }

    try {
      emitAIEvent('ai:usage-reported', {
        userId,
        tokensUsed: analysisResult.value.usage.totalTokens,
        cost: 0,
        model: analysisResult.value.model,
      });
    } catch {
      /* non-critical */
    }

    return success(analysisResult.value);
  }
}
