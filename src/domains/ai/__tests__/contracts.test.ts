import { describe, it, expect } from 'vitest';
import type { AIQueryContract } from '../contracts/ai-queries';
import type { AICostTrackingContract } from '../contracts/cost-tracking-contracts';
import type { ModelSelectionContract } from '../contracts/model-selection-contracts';

describe('AI contracts', () => {
  it('AIQueryContract defines required methods', () => {
    const contract: AIQueryContract = {
      getUsage: async () => ({ tokensUsed: 0, cost: 0 }),
      getAvailableModels: async () => [],
      isFeatureEnabled: async () => false,
    };
    expect(contract.getUsage).toBeDefined();
    expect(contract.getAvailableModels).toBeDefined();
    expect(contract.isFeatureEnabled).toBeDefined();
  });

  it('AICostTrackingContract defines required methods', () => {
    const contract: AICostTrackingContract = {
      recordUsage: async () => undefined,
      getUserCost: async () => 0,
      getTotalCost: async () => 0,
      getUsageByModel: async () => ({ tokens: 0, cost: 0 }),
      setCostThreshold: async () => undefined,
    };
    expect(contract.recordUsage).toBeDefined();
    expect(contract.getUserCost).toBeDefined();
    expect(contract.getTotalCost).toBeDefined();
    expect(contract.getUsageByModel).toBeDefined();
    expect(contract.setCostThreshold).toBeDefined();
  });

  it('ModelSelectionContract defines required methods', () => {
    const contract: ModelSelectionContract = {
      getBestModelForTask: async () => '',
      getModelsByCapability: async () => [],
      getModelPricing: async () => null,
      isModelAvailable: async () => false,
    };
    expect(contract.getBestModelForTask).toBeDefined();
    expect(contract.getModelsByCapability).toBeDefined();
    expect(contract.getModelPricing).toBeDefined();
    expect(contract.isModelAvailable).toBeDefined();
  });
});
