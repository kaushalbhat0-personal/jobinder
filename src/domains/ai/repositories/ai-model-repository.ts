import type { AIModel } from '../entities/ai-model';
import type { Result } from '@/shared/core/result';

export interface AIModelRepository {
  findById(id: string): Promise<AIModel | null>;
  findEnabled(): Promise<AIModel[]>;
  findByCapability(capability: string): Promise<AIModel[]>;
  save(model: AIModel): Promise<Result<AIModel>>;
}
