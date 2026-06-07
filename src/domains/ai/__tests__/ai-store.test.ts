import { describe, it, expect, beforeEach } from 'vitest';
import { useAIStore } from '../stores/ai-store';

describe('AIStore', () => {
  beforeEach(() => {
    useAIStore.getState().reset();
  });

  it('initialises with empty models', () => {
    const state = useAIStore.getState();
    expect(state.models).toEqual([]);
    expect(state.totalCost).toBe(0);
    expect(state.isProcessing).toBe(false);
  });

  it('sets models', () => {
    useAIStore.getState().setModels([{ id: 'm1' } as never]);
    expect(useAIStore.getState().models).toHaveLength(1);
  });

  it('resets correctly', () => {
    useAIStore.getState().setTotalCost(100);
    useAIStore.getState().reset();
    expect(useAIStore.getState().totalCost).toBe(0);
  });
});
