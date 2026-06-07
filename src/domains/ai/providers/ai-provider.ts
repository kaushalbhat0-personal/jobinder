import type { z } from 'zod';

export interface AICompleteParams {
  systemPrompt: string;
  userPrompt: string;
  schema?: z.ZodSchema<unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse<T = unknown> {
  data: T;
  usage: AITokenUsage;
}

export interface AIStreamParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIChunk {
  content: string;
  done: boolean;
}

export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIProvider {
  readonly name: string;
  readonly model: string;

  complete<T>(params: AICompleteParams): Promise<AIResponse<T>>;
  stream?(params: AIStreamParams): AsyncIterable<AIChunk>;
  embed?(text: string): Promise<number[]>;
  estimateCost(usage: AITokenUsage): number;
}
