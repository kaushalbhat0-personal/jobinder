import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/shared/lib/logger';

describe('Logger', () => {
  const env = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('info logs structured JSON', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('test message', { key: 'value' });

    const call = spy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(call);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('test message');
    expect(parsed.meta).toEqual({ key: 'value' });
    expect(parsed.timestamp).toBeDefined();
  });

  it('warn logs to console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('warning');

    const parsed = JSON.parse(spy.mock.calls[0]?.[0] as string);
    expect(parsed.level).toBe('warn');
  });

  it('error logs to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('error message');

    const parsed = JSON.parse(spy.mock.calls[0]?.[0] as string);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('error message');
  });

  it('debug does not log in production', () => {
    const original = env['NODE_ENV'];
    env['NODE_ENV'] = 'production';
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    logger.debug('debug message');
    expect(spy).not.toHaveBeenCalled();

    env['NODE_ENV'] = original;
  });

  it('debug logs in non-production', () => {
    const original = env['NODE_ENV'];
    env['NODE_ENV'] = 'development';
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    logger.debug('debug');
    expect(spy).toHaveBeenCalledTimes(1);

    env['NODE_ENV'] = original;
  });

  it('logs without meta', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('no meta');

    const parsed = JSON.parse(spy.mock.calls[0]?.[0] as string);
    expect(parsed.message).toBe('no meta');
    expect(parsed.meta).toBeUndefined();
  });
});
