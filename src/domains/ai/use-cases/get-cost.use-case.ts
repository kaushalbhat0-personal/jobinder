import type { Result } from '@/shared/core/result';
import { success } from '@/shared/core/result';
import type { AIUsageRepository } from '../repositories/ai-usage-repository';

export class GetCostUseCase {
  constructor(private readonly usageRepo: AIUsageRepository) {}

  async execute(userId: string): Promise<Result<number>> {
    const cost = await this.usageRepo.getUserTotalCost(userId);
    return success(cost);
  }
}
