export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { getEnv } = await import('@/shared/config/env');
      getEnv();
      console.log('[Startup] Environment validation passed');
    } catch (err) {
      console.error(
        '[Startup] Environment validation failed:',
        err instanceof Error ? err.message : err,
      );
      process.exit(1);
    }
  }
}
