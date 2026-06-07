import type { AIProvider, AICompleteParams, AIResponse, AITokenUsage } from './ai-provider';

export class DeepSeekAdapter implements AIProvider {
  readonly name = 'deepseek';
  readonly model = 'deepseek-v4-flash';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async complete<T>(params: AICompleteParams): Promise<AIResponse<T>> {
    throw new Error('DeepSeekAdapter.complete not yet implemented');
  }

  estimateCost(usage: AITokenUsage): number {
    const inputRate = 0.00015;
    const outputRate = 0.0006;
    const inputCost = (usage.promptTokens / 1000) * inputRate;
    const outputCost = (usage.completionTokens / 1000) * outputRate;
    return inputCost + outputCost;
  }
}
