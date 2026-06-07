import { describe, it, expect, beforeEach } from 'vitest';
import { resetEnv } from '@/shared/config/env';

describe('Environment Validation', () => {
  const env = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    resetEnv();
  });

  it('returns validated env when all variables are present', async () => {
    env['NEXT_PUBLIC_SUPABASE_URL'] = 'https://test.supabase.co';
    env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'test-anon-key';
    env['NEXT_PUBLIC_APP_URL'] = 'https://app.example.com';
    env['DEEPSEEK_API_KEY'] = 'test-deepseek-key';
    env['NODE_ENV'] = 'test';

    const { getEnv } = await import('@/shared/config/env');
    const result = getEnv();
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(result.DEEPSEEK_API_KEY).toBe('test-deepseek-key');
    expect(result.NODE_ENV).toBe('test');
  });

  it('throws when required variables are missing', async () => {
    env['NEXT_PUBLIC_SUPABASE_URL'] = undefined;
    env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = undefined;
    env['DEEPSEEK_API_KEY'] = undefined;

    const { getEnv } = await import('@/shared/config/env');
    expect(() => getEnv()).toThrow('Invalid environment variables');
  });

  it('throws on invalid URL', async () => {
    env['NEXT_PUBLIC_SUPABASE_URL'] = 'not-a-url';
    env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'test-anon-key';
    env['NEXT_PUBLIC_APP_URL'] = 'https://app.example.com';
    env['DEEPSEEK_API_KEY'] = 'test-deepseek-key';

    const { getEnv } = await import('@/shared/config/env');
    expect(() => getEnv()).toThrow('Invalid environment variables');
  });

  it('throws on empty key', async () => {
    env['NEXT_PUBLIC_SUPABASE_URL'] = 'https://test.supabase.co';
    env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = '';
    env['NEXT_PUBLIC_APP_URL'] = 'https://app.example.com';
    env['DEEPSEEK_API_KEY'] = 'test-deepseek-key';

    const { getEnv } = await import('@/shared/config/env');
    expect(() => getEnv()).toThrow('Invalid environment variables');
  });
});
