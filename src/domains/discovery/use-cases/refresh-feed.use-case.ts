import type { Result } from '@/shared/core/result';
import { success } from '@/shared/core/result';
import type { UserProfile } from '@/domains/profile/entities/user-profile';
import type { ResumeAnalysisResult } from '@/domains/ai/schemas/resume-analysis-schema';
import type { DiscoveryRepository } from '../repositories/discovery-repository';
import { FeedGenerationService } from '../services/feed-generation.service';
import { emitDiscoveryEvent } from '../events/discovery-events';

export class RefreshFeedUseCase {
  constructor(
    private readonly feedService: FeedGenerationService,
    private readonly discoveryRepo: DiscoveryRepository,
  ) {}

  async execute(
    userId: string,
    profile: UserProfile,
    analysis: ResumeAnalysisResult | null,
  ): Promise<Result<void>> {
    const generationId = `refresh-${userId}-${Date.now()}`;

    emitDiscoveryEvent('discovery:feed-refresh-requested', { userId, generationId });

    const result = await this.feedService.generate(
      generationId,
      userId,
      'refresh',
      profile,
      analysis,
    );

    if (!result.isSuccess()) return result as unknown as Result<void>;

    const saveResult = await this.discoveryRepo.saveFeed(result.value.feed);
    if (!saveResult.isSuccess()) return saveResult as unknown as Result<void>;

    emitDiscoveryEvent('discovery:feed-generated', {
      userId,
      generationId,
      jobCount: result.value.feed.items.length,
    });

    return success(undefined);
  }
}
