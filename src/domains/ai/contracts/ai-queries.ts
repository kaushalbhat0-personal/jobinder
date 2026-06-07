export interface AIQueryContract {
  getUsage(userId: string): Promise<{ tokensUsed: number; cost: number }>;
  getAvailableModels(): Promise<string[]>;
  isFeatureEnabled(feature: string): Promise<boolean>;
}
