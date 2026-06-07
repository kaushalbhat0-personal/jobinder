import type { Result } from '@/shared/core/result';
import type { JobMatch } from '../entities/job-match';
import type { FeedGeneration, FeedGenerationStatus, FeedSource } from '../entities/feed-generation';

export interface FeedGenerationContract {
  generate(
    userId: string,
    source: FeedSource,
  ): Promise<Result<{ generation: FeedGeneration; matches: JobMatch[] }>>;
  refresh(userId: string): Promise<Result<{ generation: FeedGeneration; matches: JobMatch[] }>>;
  getStatus(generationId: string): Promise<Result<FeedGenerationStatus>>;
  getHistory(userId: string): Promise<Result<FeedGeneration[]>>;
}
