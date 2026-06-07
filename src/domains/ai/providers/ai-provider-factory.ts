import type { AIProvider } from './ai-provider';
import { DeepSeekAdapter } from './deepseek.adapter';
import { OpenRouterAdapter } from './openrouter.adapter';
import { InfrastructureError } from '@/shared/core/errors';

export type AIProviderType = 'deepseek' | 'openrouter' | 'openai' | 'claude' | 'gemini';

export function createProvider(type: AIProviderType): AIProvider {
  switch (type) {
    case 'openrouter': {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new InfrastructureError('OPENROUTER_API_KEY is not set');
      return new OpenRouterAdapter({
        apiKey,
        model: process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat-v3-0324:free',
      });
    }
    case 'deepseek': {
      return new DeepSeekAdapter();
    }
    case 'openai':
    case 'claude':
    case 'gemini':
      throw new InfrastructureError(`${type} provider not yet implemented`);
  }
}

export function getFallbackModels(): string[] {
  const raw = process.env.OPENROUTER_FALLBACK_MODELS ?? '';
  return raw
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
}

export function createProviderFromEnv(): AIProvider {
  const configured = process.env.AI_PROVIDER ?? 'deepseek';
  return createProvider(configured as AIProviderType);
}
