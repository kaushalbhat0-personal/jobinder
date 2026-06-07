import type { AIUsageRecord } from '../entities/ai-usage';
import type { Result } from '@/shared/core/result';

export interface AIUsageRepository {
  findById(id: string): Promise<AIUsageRecord | null>;
  findByUser(userId: string): Promise<AIUsageRecord[]>;
  findByModel(model: string): Promise<AIUsageRecord[]>;
  save(record: AIUsageRecord): Promise<Result<AIUsageRecord>>;
  getUserTotalCost(userId: string): Promise<number>;
  getTotalCost(): Promise<number>;
}
