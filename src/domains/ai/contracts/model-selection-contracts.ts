import type { ModelCapability } from '../entities/ai-model';

export interface ModelSelectionContract {
  getBestModelForTask(task: string, capabilities: ModelCapability[]): Promise<string>;
  getModelsByCapability(capability: ModelCapability): Promise<string[]>;
  getModelPricing(modelId: string): Promise<{ inputPer1K: number; outputPer1K: number } | null>;
  isModelAvailable(modelId: string): Promise<boolean>;
}
