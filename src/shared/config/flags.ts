import { getEnv } from './env';

export interface FeatureFlags {
  aiAnalysis: boolean;
  feedGeneration: boolean;
  jobProviders: boolean;
}

export function getFlags(): FeatureFlags {
  const env = getEnv();
  return {
    aiAnalysis: env.AI_ANALYSIS === 'true',
    feedGeneration: env.FEED_GENERATION === 'true',
    jobProviders: env.JOB_PROVIDERS === 'true',
  };
}
