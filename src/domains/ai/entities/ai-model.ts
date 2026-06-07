import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type ModelCapability = 'chat' | 'stream' | 'embed' | 'vision' | 'reasoning';

export interface ModelPricing {
  inputPer1K: number;
  outputPer1K: number;
  currency: string;
}

export interface AIModelData {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  capabilities: ModelCapability[];
  pricing: ModelPricing;
  contextWindow: number;
  maxOutputTokens: number;
  isEnabled: boolean;
}

export class AIModel {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly provider: string,
    public readonly modelId: string,
    public readonly capabilities: ModelCapability[],
    public readonly pricing: ModelPricing,
    public readonly contextWindow: number,
    public readonly maxOutputTokens: number,
    public readonly isEnabled: boolean,
  ) {}

  static create(data: AIModelData): Result<AIModel> {
    if (!data.id) return failure(new ValidationError('Model id is required'));
    if (data.contextWindow <= 0)
      return failure(new ValidationError('Context window must be positive'));
    if (data.maxOutputTokens <= 0)
      return failure(new ValidationError('Max output tokens must be positive'));
    if (data.pricing.inputPer1K < 0)
      return failure(new ValidationError('Input price cannot be negative'));
    return success(
      new AIModel(
        data.id,
        data.name,
        data.provider,
        data.modelId,
        data.capabilities,
        data.pricing,
        data.contextWindow,
        data.maxOutputTokens,
        data.isEnabled,
      ),
    );
  }

  hasCapability(capability: ModelCapability): boolean {
    return this.capabilities.includes(capability);
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.pricing.inputPer1K;
    const outputCost = (outputTokens / 1000) * this.pricing.outputPer1K;
    return inputCost + outputCost;
  }

  enable(): AIModel {
    return new AIModel(
      this.id,
      this.name,
      this.provider,
      this.modelId,
      this.capabilities,
      this.pricing,
      this.contextWindow,
      this.maxOutputTokens,
      true,
    );
  }

  disable(): AIModel {
    return new AIModel(
      this.id,
      this.name,
      this.provider,
      this.modelId,
      this.capabilities,
      this.pricing,
      this.contextWindow,
      this.maxOutputTokens,
      false,
    );
  }
}
