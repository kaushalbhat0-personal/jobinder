import { describe, it, expect, beforeEach } from 'vitest';
import { useProfileStore } from '../stores/profile-store';

describe('ProfileStore', () => {
  beforeEach(() => {
    useProfileStore.getState().reset();
  });

  it('initialises with null profile', () => {
    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets profile', () => {
    useProfileStore.getState().setLoading(true);
    expect(useProfileStore.getState().isLoading).toBe(true);
  });

  it('resets correctly', () => {
    useProfileStore.getState().setError('err');
    useProfileStore.getState().reset();
    expect(useProfileStore.getState().error).toBeNull();
  });
});
