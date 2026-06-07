import { checkRateLimit, clearRateLimits } from './rate-limiter';

const DAILY_LIMIT_FREE = 10;
const DAILY_LIMIT_PREMIUM = 1000;

export type AIRateLimitAction = 'resume_analysis' | 'feed_generation' | 'job_matching';

export interface AIRateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkAIRateLimit(
  userId: string,
  action: AIRateLimitAction,
  isPremium: boolean,
): AIRateLimitResult {
  const limit = isPremium ? DAILY_LIMIT_PREMIUM : DAILY_LIMIT_FREE;
  const allowed = checkRateLimit(action, userId, {
    maxRequests: limit,
    windowMs: 24 * 60 * 60 * 1000,
  });

  return {
    allowed,
    remaining: allowed ? limit : 0,
  };
}

export function resetDailyLimits(): void {
  clearRateLimits();
}
