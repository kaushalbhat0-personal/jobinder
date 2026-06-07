import type { AIPrompt } from '../entities/ai-prompt';
import type { Result } from '@/shared/core/result';

export interface AIPromptRepository {
  findById(id: string): Promise<AIPrompt | null>;
  findActiveByCategory(category: string): Promise<AIPrompt[]>;
  findByName(name: string): Promise<AIPrompt | null>;
  save(prompt: AIPrompt): Promise<Result<AIPrompt>>;
}
