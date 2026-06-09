'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/domains/auth/stores/auth-store';
import { SupabaseAuthService } from '@/domains/auth/services/supabase-auth-service';
import { emitAuthEvent, AuthEventTypes } from '@/domains/auth/events/auth-events';
import { track } from '@/shared/analytics/track';
import { useRouter } from 'next/navigation';

const authService = new SupabaseAuthService();

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    store.setLoading(true);
    const unsubscribe = authService.onAuthStateChange((user) => {
      store.setUser(user);
      store.setLoading(false);
    });
    authService
      .getSession()
      .then((session) => {
        store.setUser(session?.user ?? null);
        store.setLoading(false);
      })
      .catch(() => {
        store.setLoading(false);
      });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      await authService.signInWithOAuth('google');
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
      store.setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const user = await authService.signInWithPassword(email, password);
      store.setUser(user);
      emitAuthEvent(AuthEventTypes.UserSignedIn, {
        userId: user.id,
        email: user.email,
        method: 'password',
      });
      track('user_signed_in', { method: 'password', userId: user.id });
      store.setLoading(false);
      router.push('/dashboard');
      return user;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Invalid email or password');
      store.setLoading(false);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const user = await authService.signUp(email, password, name);
      store.setUser(user);
      emitAuthEvent(AuthEventTypes.UserSignedUp, { userId: user.id, email: user.email });
      track('user_signed_up', { userId: user.id, email: user.email });
      store.setLoading(false);
      return user;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create account');
      store.setLoading(false);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    store.setLoading(true);
    store.setError(null);
    try {
      await authService.resetPasswordForEmail(email);
      emitAuthEvent(AuthEventTypes.PasswordResetRequested, { email });
      track('password_reset_requested', { email });
      store.setLoading(false);
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to send reset email');
      store.setLoading(false);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    store.setLoading(true);
    store.setError(null);
    try {
      await authService.updatePassword(newPassword);
      const session = await authService.getSession();
      if (session?.user) {
        emitAuthEvent(AuthEventTypes.PasswordResetCompleted, { userId: session.user.id });
        track('password_reset_completed', { userId: session.user.id });
      }
      store.setLoading(false);
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to update password');
      store.setLoading(false);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    const userId = store.user?.id;
    store.setLoading(true);
    try {
      await authService.signOut();
      store.reset();
      if (userId) {
        emitAuthEvent(AuthEventTypes.UserSignedOut, { userId });
        track('user_signed_out', { userId });
      }
      router.push('/login');
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to sign out');
      store.setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.user?.id]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    signInWithGoogle,
    signInWithPassword,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
  };
}
