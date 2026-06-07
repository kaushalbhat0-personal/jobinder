import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { DiscoveryRepository } from '../repositories/discovery-repository';
import type { SwipeSession, SwipeDirection } from '../entities/swipe-session';
import { NotFoundError } from '@/shared/core/errors';
import { recordSwipeFeedback } from '../services/swipe-feedback.service';

export class SwipeUseCase {
  constructor(private readonly discoveryRepo: DiscoveryRepository) {}

  async execute(
    userId: string,
    jobId: string,
    direction: SwipeDirection,
    score: number | null,
  ): Promise<Result<SwipeSession>> {
    const session = await this.discoveryRepo.getActiveSession(userId);
    if (!session) return failure(new NotFoundError('No active swipe session'));
    const updated = session.recordAction(jobId, direction, score);
    const saveResult = await this.discoveryRepo.saveSession(updated);
    if (!saveResult.isSuccess()) return saveResult;
    recordSwipeFeedback(userId, jobId, direction, score);
    return success(updated);
  }
}
