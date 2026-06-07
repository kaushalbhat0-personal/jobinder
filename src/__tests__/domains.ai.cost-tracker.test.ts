import { describe, it, expect, beforeEach } from 'vitest';
import { AICostTracker } from '@/domains/ai/services/cost-tracker';

describe('AICostTracker', () => {
  let tracker: AICostTracker;

  beforeEach(() => {
    tracker = new AICostTracker();
  });

  it('records usage and returns cost per user', async () => {
    await tracker.record({
      userId: 'user-1',
      model: 'deepseek-v4-flash',
      provider: 'deepseek',
      promptTokens: 500,
      completionTokens: 200,
      totalTokens: 700,
      cost: 0.0015,
      latencyMs: 1200,
      endpoint: 'resume:analyze',
      success: true,
    });

    const cost = await tracker.getUserCost('user-1');
    expect(cost).toBe(0.0015);
  });

  it('aggregates costs across multiple records', async () => {
    await tracker.record({
      userId: 'user-1',
      model: 'deepseek-v4-flash',
      provider: 'deepseek',
      promptTokens: 500,
      completionTokens: 200,
      totalTokens: 700,
      cost: 0.001,
      latencyMs: 1000,
      endpoint: 'resume:analyze',
      success: true,
    });
    await tracker.record({
      userId: 'user-1',
      model: 'deepseek-v4-flash',
      provider: 'deepseek',
      promptTokens: 300,
      completionTokens: 100,
      totalTokens: 400,
      cost: 0.0005,
      latencyMs: 800,
      endpoint: 'job:match',
      success: true,
    });

    const cost = await tracker.getUserCost('user-1');
    expect(cost).toBe(0.0015);
  });

  it('separates costs by user', async () => {
    await tracker.record({
      userId: 'user-1',
      model: 'deepseek-v4-flash',
      provider: 'deepseek',
      promptTokens: 500,
      completionTokens: 200,
      totalTokens: 700,
      cost: 0.001,
      latencyMs: 1000,
      endpoint: 'resume:analyze',
      success: true,
    });
    await tracker.record({
      userId: 'user-2',
      model: 'deepseek-v4-flash',
      provider: 'deepseek',
      promptTokens: 1000,
      completionTokens: 500,
      totalTokens: 1500,
      cost: 0.003,
      latencyMs: 2000,
      endpoint: 'resume:analyze',
      success: true,
    });

    expect(await tracker.getUserCost('user-1')).toBe(0.001);
    expect(await tracker.getUserCost('user-2')).toBe(0.003);
  });

  it('returns 0 for users with no records', async () => {
    expect(await tracker.getUserCost('nonexistent')).toBe(0);
  });
});
