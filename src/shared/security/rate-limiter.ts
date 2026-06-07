type RateLimitKey = string;
type RateLimitAction = string;

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<RateLimitKey, RateLimitEntry>();

function buildKey(action: RateLimitAction, identifier: string): RateLimitKey {
  return `${action}:${identifier}`;
}

export function checkRateLimit(
  action: RateLimitAction,
  identifier: string,
  config: RateLimitConfig,
): boolean {
  const key = buildKey(action, identifier);
  const now = Date.now();
  const entry = stores.get(key);

  if (!entry || now > entry.resetAt) {
    stores.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function getRemainingRequests(
  action: RateLimitAction,
  identifier: string,
  config: RateLimitConfig,
): number {
  const key = buildKey(action, identifier);
  const now = Date.now();
  const entry = stores.get(key);

  if (!entry || now > entry.resetAt) {
    return config.maxRequests;
  }

  return Math.max(0, config.maxRequests - entry.count);
}

export function getResetTime(action: RateLimitAction, identifier: string): number | null {
  const key = buildKey(action, identifier);
  const entry = stores.get(key);
  if (!entry) return null;
  return entry.resetAt;
}

export function clearRateLimits(): void {
  stores.clear();
}
