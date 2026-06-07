function isFeatureEnabled(key: string): boolean {
  return process.env[`NEXT_PUBLIC_FEATURE_${key}`] === 'true';
}

function computeFeatures() {
  return {
    REFERRALS: isFeatureEnabled('REFERRALS'),
    AUTO_APPLY: isFeatureEnabled('AUTO_APPLY'),
    INTERVIEW_COACH: isFeatureEnabled('INTERVIEW_COACH'),
    NETWORKING_AGENT: isFeatureEnabled('NETWORKING_AGENT'),
    REFERRAL_MARKET: isFeatureEnabled('REFERRAL_MARKET'),
    AI_PIPELINE: isFeatureEnabled('AI_PIPELINE'),
  } as const;
}

export const FEATURES = computeFeatures();

export type FeatureKey = keyof typeof FEATURES;
