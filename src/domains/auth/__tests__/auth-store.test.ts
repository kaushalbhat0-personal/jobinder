import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/auth-store';
import { User } from '../entities/user';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it('initialises with null user and not authenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets user and marks authenticated', async () => {
    const result = User.create({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (result.isSuccess()) {
      useAuthStore.getState().setUser(result.value);
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.isAuthenticated).toBe(true);
    }
  });

  it('resets to initial state', () => {
    useAuthStore.getState().setError('error');
    useAuthStore.getState().reset();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
