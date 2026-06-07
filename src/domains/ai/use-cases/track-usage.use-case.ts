import type { Result } from '@/shared/core/result';
import type { AIUsageRepository } from '../repositories/ai-usage-repository';
import type { AIUsageRecord } from '../entities/ai-usage';

export class TrackUsageUseCase {
  constructor(private readonly usageRepo: AIUsageRepository) {}

  async execute(data: Omit<AIUsageRecord, 'id' | 'timestamp'>): Promise<Result<AIUsageRecord>> {
    const record: AIUsageRecord = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    return this.usageRepo.save(record);
  }
}
