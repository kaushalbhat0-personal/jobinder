export interface ErrorReport {
  message: string;
  code: string;
  context?: Record<string, unknown>;
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
}

const sentryEnabled = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN;

export function reportError(report: ErrorReport): void {
  if (sentryEnabled) {
    try {
      // Sentry SDK will be initialized when @sentry/nextjs is added
      // const Sentry = await import('@sentry/nextjs');
      // Sentry.captureException(new Error(report.message), {
      //   tags: { code: report.code },
      //   extra: report.context,
      //   level: report.severity,
      // });
    } catch {
      // Silently fall back to console
    }
  }

  if (report.severity === 'error' || report.severity === 'fatal') {
    console.error(`[${report.code}] ${report.message}`, report.context ?? '');
  } else {
    console.warn(`[${report.code}] ${report.message}`, report.context ?? '');
  }
}

export function reportAIError(
  provider: string,
  model: string,
  error: Error,
  context?: Record<string, unknown>,
): void {
  reportError({
    message: error.message,
    code: 'AI_PROVIDER_ERROR',
    severity: 'error',
    context: { provider, model, errorName: error.name, ...context },
  });
}

export function reportRateLimitHit(userId: string, action: string): void {
  reportError({
    message: `Rate limit hit for ${action}`,
    code: 'RATE_LIMIT_HIT',
    severity: 'warning',
    context: { userId, action },
  });
}
