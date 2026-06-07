import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/supabase/client', () => ({
  createSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'u1',
            email: 'a@b.com',
            user_metadata: { full_name: 'Test User' },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'u1',
            email: 'a@b.com',
            user_metadata: { full_name: 'Test User' },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        },
        error: null,
      }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
}));

import { SupabaseAuthService } from '../services/supabase-auth-service';

describe('SupabaseAuthService', () => {
  let service: SupabaseAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabaseAuthService();
  });

  it('signs in with OAuth', async () => {
    await expect(service.signInWithOAuth('google')).resolves.toBeUndefined();
  });

  it('signs in with password', async () => {
    const user = await service.signInWithPassword('a@b.com', 'password123');
    expect(user.id).toBe('u1');
    expect(user.email).toBe('a@b.com');
  });

  it('signs up', async () => {
    const user = await service.signUp('a@b.com', 'password123', 'Test User');
    expect(user.id).toBe('u1');
  });

  it('sends password reset email', async () => {
    await expect(service.resetPasswordForEmail('a@b.com')).resolves.toBeUndefined();
  });

  it('updates password', async () => {
    await expect(service.updatePassword('newpassword123')).resolves.toBeUndefined();
  });

  it('signs out', async () => {
    await expect(service.signOut()).resolves.toBeUndefined();
  });

  it('registers auth state change handler', () => {
    const unsub = service.onAuthStateChange(vi.fn());
    expect(typeof unsub).toBe('function');
    unsub();
  });
});
