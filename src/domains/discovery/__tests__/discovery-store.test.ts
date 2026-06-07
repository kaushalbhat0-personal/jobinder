import { describe, it, expect, beforeEach } from 'vitest';
import { useDiscoveryStore } from '../stores/discovery-store';

describe('DiscoveryStore', () => {
  beforeEach(() => {
    useDiscoveryStore.getState().reset();
  });

  it('initialises with null feed and session', () => {
    const state = useDiscoveryStore.getState();
    expect(state.feed).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('sets loading state', () => {
    useDiscoveryStore.getState().setLoading(true);
    expect(useDiscoveryStore.getState().isLoading).toBe(true);
  });

  it('resets correctly', () => {
    useDiscoveryStore.getState().setError('err');
    useDiscoveryStore.getState().reset();
    expect(useDiscoveryStore.getState().error).toBeNull();
  });
});
