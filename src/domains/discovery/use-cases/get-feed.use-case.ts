import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { DiscoveryRepository } from '../repositories/discovery-repository';
import type { Feed } from '../entities/feed';
import { NotFoundError } from '@/shared/core/errors';

export class GetFeedUseCase {
  constructor(private readonly discoveryRepo: DiscoveryRepository) {}

  async execute(userId: string): Promise<Result<Feed>> {
    const feed = await this.discoveryRepo.getFeed(userId);
    if (!feed) return failure(new NotFoundError('Feed not found'));
    return success(feed);
  }
}
