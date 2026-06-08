import { createSupabaseBrowserClient } from '@/shared/lib/supabase/client';
import type { AuthRepository } from '../repositories/auth-repository';
import { User } from '../entities/user';
import { ValidationError } from '@/shared/core/errors';

export class SupabaseAuthService implements AuthRepository {
  private client = createSupabaseBrowserClient();

  async signInWithOAuth(provider: 'google'): Promise<void> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }

  async signInWithOtp(email: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }

  async signInWithPassword(email: string, password: string): Promise<User> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new ValidationError('Sign-in failed');
    return this.mapSupabaseUser(data.user);
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    console.log('[AUTH-SERVICE] signUp() called with:', {
      email,
      name,
      passwordLength: password.length,
    });
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, name },
      },
    });
    console.log('[AUTH-SERVICE] Supabase signUp response:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      error: error?.message,
    });
    if (error) {
      console.error('[AUTH-SERVICE] Supabase signUp error:', error);
      // Provide better error messages for common scenarios
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        throw new ValidationError(
          'An account with this email already exists. Please sign in instead.',
        );
      }
      throw error;
    }
    if (!data.user) {
      console.error('[AUTH-SERVICE] Supabase signUp returned no user');
      throw new ValidationError('Sign-up failed. Please try again.');
    }
    console.log('[AUTH-SERVICE] signUp() successful, user created:', data.user.id);
    return this.mapSupabaseUser(data.user);
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  async verifyOtp(email: string, token: string): Promise<User> {
    const { data, error } = await this.client.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error || !data.user) throw error ?? new ValidationError('OTP verification failed');
    return this.mapSupabaseUser(data.user);
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getSession(): Promise<{ user: User } | null> {
    const { data } = await this.client.auth.getSession();
    if (!data.session?.user) return null;
    return { user: this.mapSupabaseUser(data.session.user) };
  }

  async getUser(id: string): Promise<User | null> {
    const { data } = await this.client.auth.getUser(id);
    if (!data?.user) return null;
    return this.mapSupabaseUser(data.user);
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? this.mapSupabaseUser(session.user) : null);
    });
    return () => subscription.unsubscribe();
  }

  private mapSupabaseUser(supabaseUser: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
  }): User {
    const result = User.create({
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name:
        (supabaseUser.user_metadata?.full_name as string) ??
        (supabaseUser.user_metadata?.name as string) ??
        null,
      avatarUrl: (supabaseUser.user_metadata?.avatar_url as string) ?? null,
      createdAt: supabaseUser.created_at ? new Date(supabaseUser.created_at) : new Date(),
      updatedAt: supabaseUser.updated_at ? new Date(supabaseUser.updated_at) : new Date(),
    });
    return result.getOrThrow();
  }
}
