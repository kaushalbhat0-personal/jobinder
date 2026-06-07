import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Feature Flags', () => {
  const env = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    vi.resetModules();
    env['NEXT_PUBLIC_FEATURE_REFERRALS'] = undefined;
    env['NEXT_PUBLIC_FEATURE_AUTO_APPLY'] = undefined;
    env['NEXT_PUBLIC_FEATURE_INTERVIEW_COACH'] = undefined;
    env['NEXT_PUBLIC_FEATURE_NETWORKING_AGENT'] = undefined;
    env['NEXT_PUBLIC_FEATURE_REFERRAL_MARKET'] = undefined;
    env['NEXT_PUBLIC_FEATURE_AI_PIPELINE'] = undefined;
  });

  it('defaults all features to false', async () => {
    const { FEATURES } = await import('@/shared/config/features');
    expect(FEATURES.REFERRALS).toBe(false);
    expect(FEATURES.AUTO_APPLY).toBe(false);
    expect(FEATURES.INTERVIEW_COACH).toBe(false);
    expect(FEATURES.NETWORKING_AGENT).toBe(false);
    expect(FEATURES.REFERRAL_MARKET).toBe(false);
    expect(FEATURES.AI_PIPELINE).toBe(false);
  });

  it('reads feature flags from environment', async () => {
    env['NEXT_PUBLIC_FEATURE_REFERRALS'] = 'true';
    env['NEXT_PUBLIC_FEATURE_AUTO_APPLY'] = 'true';

    const { FEATURES } = await import('@/shared/config/features');
    expect(FEATURES.REFERRALS).toBe(true);
    expect(FEATURES.AUTO_APPLY).toBe(true);
    expect(FEATURES.INTERVIEW_COACH).toBe(false);
  });

  it('treats non-true values as false', async () => {
    env['NEXT_PUBLIC_FEATURE_REFERRALS'] = '1';
    env['NEXT_PUBLIC_FEATURE_AUTO_APPLY'] = 'yes';
    env['NEXT_PUBLIC_FEATURE_INTERVIEW_COACH'] = 'TRUE';

    const { FEATURES } = await import('@/shared/config/features');
    expect(FEATURES.REFERRALS).toBe(false);
    expect(FEATURES.AUTO_APPLY).toBe(false);
    expect(FEATURES.INTERVIEW_COACH).toBe(false);
  });
});
