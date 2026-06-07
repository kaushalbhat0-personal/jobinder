import { describe, it, expect } from 'vitest';
import { AIModel } from '../entities/ai-model';

const validData = {
  id: 'model-1',
  name: 'DeepSeek V4',
  provider: 'deepseek',
  modelId: 'deepseek-v4-flash',
  capabilities: ['chat', 'stream', 'reasoning'] as Array<
    'chat' | 'stream' | 'embed' | 'vision' | 'reasoning'
  >,
  pricing: { inputPer1K: 0.00015, outputPer1K: 0.0006, currency: 'USD' },
  contextWindow: 128000,
  maxOutputTokens: 8192,
  isEnabled: true,
};

describe('AIModel entity', () => {
  it('creates with valid data', () => {
    const result = AIModel.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.name).toBe('DeepSeek V4');
      expect(result.value.isEnabled).toBe(true);
    }
  });

  it('fails when id is empty', () => {
    const result = AIModel.create({ ...validData, id: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when context window is zero', () => {
    const result = AIModel.create({ ...validData, contextWindow: 0 });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when output tokens is zero', () => {
    const result = AIModel.create({ ...validData, maxOutputTokens: 0 });
    expect(result.isFailure()).toBe(true);
  });

  it('checks capability', () => {
    const result = AIModel.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.hasCapability('chat')).toBe(true);
      expect(result.value.hasCapability('embed')).toBe(false);
    }
  });

  it('estimates cost', () => {
    const result = AIModel.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const cost = result.value.estimateCost(1000, 500);
      expect(cost).toBe(0.00015 * 1 + 0.0006 * 0.5);
    }
  });

  it('toggles enabled state', () => {
    const result = AIModel.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.disable().isEnabled).toBe(false);
      expect(result.value.disable().enable().isEnabled).toBe(true);
    }
  });
});
