import type { AIProvider, AICompleteParams, AIResponse, AITokenUsage } from './ai-provider';
import { InfrastructureError } from '@/shared/core/errors';

interface OpenRouterResponse {
  id: string;
  choices: Array<{ message: { content: string } }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export class OpenRouterAdapter implements AIProvider {
  readonly name = 'openrouter';
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl ?? 'https://openrouter.ai/api/v1';
  }

  async complete<T>(params: AICompleteParams): Promise<AIResponse<T>> {
    const messages = [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userPrompt },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'JOBinder',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 4096,
        response_format: params.schema ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new InfrastructureError(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const body = (await response.json()) as OpenRouterResponse;
    const content = body.choices?.[0]?.message?.content ?? '';

    const usage: AITokenUsage = {
      promptTokens: body.usage?.prompt_tokens ?? 0,
      completionTokens: body.usage?.completion_tokens ?? 0,
      totalTokens: body.usage?.total_tokens ?? 0,
    };

    if (params.schema) {
      const parsed = params.schema.safeParse(JSON.parse(content));
      if (!parsed.success) {
        throw new InfrastructureError(`AI response validation failed: ${parsed.error.message}`);
      }
      return { data: parsed.data as T, usage };
    }

    return { data: content as unknown as T, usage };
  }

  estimateCost(usage: AITokenUsage): number {
    const inputRate = 0.00015;
    const outputRate = 0.0006;
    const inputCost = (usage.promptTokens / 1000) * inputRate;
    const outputCost = (usage.completionTokens / 1000) * outputRate;
    return inputCost + outputCost;
  }
}
