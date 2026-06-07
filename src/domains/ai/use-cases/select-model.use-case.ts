import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { AIModelRepository } from '../repositories/ai-model-repository';
import type { AIModel } from '../entities/ai-model';
import { NotFoundError } from '@/shared/core/errors';

export class SelectModelUseCase {
  constructor(private readonly modelRepo: AIModelRepository) {}

  async execute(capability: string): Promise<Result<AIModel>> {
    const models = await this.modelRepo.findByCapability(capability);
    const enabled = models.filter((m) => m.isEnabled);
    if (enabled.length === 0)
      return failure(new NotFoundError(`No enabled model found for capability: ${capability}`));
    return success(enabled[0]!);
  }
}
