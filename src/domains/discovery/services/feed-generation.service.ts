import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { UserProfile } from '@/domains/profile/entities/user-profile';
import type { ResumeAnalysisResult } from '@/domains/ai/schemas/resume-analysis-schema';
import { JobMatchingService } from './job-matching.service';
import type { JobProvider } from '../providers/job-provider';
import { FeedGeneration, type FeedSource } from '../entities/feed-generation';
import { FeedItem } from '../entities/feed-item';
import { Feed } from '../entities/feed';

export interface FeedGenerationResult {
  generation: FeedGeneration;
  feed: Feed;
}

export class FeedGenerationService {
  constructor(
    private readonly providers: JobProvider[],
    private readonly matchingService: JobMatchingService,
  ) {}

  async generate(
    generationId: string,
    userId: string,
    source: FeedSource,
    profile: UserProfile,
    analysis: ResumeAnalysisResult | null,
  ): Promise<Result<FeedGenerationResult>> {
    const generation = FeedGeneration.create({
      id: generationId,
      userId,
      jobCount: 0,
      source,
      status: 'processing',
      createdAt: new Date(),
      completedAt: null,
      error: null,
    }).getOrThrow();

    try {
      const allJobs: { provider: string; jobId: string }[] = [];
      const jobsMap = new Map<string, { title: string; score: number; reason: string }>();

      for (const provider of this.providers) {
        const result = await provider.fetchJobs();
        if (!result.isSuccess()) continue;
        for (const job of result.value) {
          allJobs.push({ provider: provider.name, jobId: job.id });
          const matchResult = this.matchingService.calculate({ job, profile, analysis });
          if (matchResult.isSuccess()) {
            jobsMap.set(job.id, {
              title: job.title,
              score: matchResult.value.match.score,
              reason: matchResult.value.match.reasons.join('; '),
            });
          }
        }
      }

      const sorted = [...jobsMap.entries()]
        .map(([jobId, data]) => ({ jobId, ...data }))
        .sort((a, b) => b.score - a.score);

      const items: FeedItem[] = sorted.map(
        (s) => new FeedItem(s.jobId, 'job', s.score, { jobId: s.jobId, reason: s.reason }),
      );

      const feedResult = Feed.create({
        id: `feed-${generationId}`,
        userId,
        items,
        cursor: null,
        hasMore: false,
        generatedAt: new Date(),
        createdAt: new Date(),
      });

      if (!feedResult.isSuccess()) return feedResult as unknown as Result<FeedGenerationResult>;

      const completed = generation.complete(items.length);
      return success({ generation: completed, feed: feedResult.value });
    } catch (err) {
      const failed = generation.fail(err instanceof Error ? err.message : 'Unknown error');
      return failure(new Error(failed.error ?? 'Feed generation failed'));
    }
  }
}
