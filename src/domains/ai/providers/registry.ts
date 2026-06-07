import type { AIProvider } from './ai-provider';
import { DeepSeekAdapter } from './deepseek.adapter';

export type ProviderName = 'deepseek' | 'openai' | 'claude' | 'gemini';

const providers: Record<ProviderName, () => AIProvider> = {
  deepseek: () => new DeepSeekAdapter(),
  openai: () => {
    throw new Error('OpenAI provider not yet implemented');
  },
  claude: () => {
    throw new Error('Claude provider not yet implemented');
  },
  gemini: () => {
    throw new Error('Gemini provider not yet implemented');
  },
};

export function getProvider(name: ProviderName): AIProvider {
  return providers[name]();
}

export function registerProvider(name: ProviderName, factory: () => AIProvider): void {
  providers[name] = factory;
}
