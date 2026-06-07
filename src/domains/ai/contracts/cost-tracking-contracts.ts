export interface AICostTrackingContract {
  recordUsage(userId: string, tokens: number, cost: number, model: string): Promise<void>;
  getUserCost(userId: string): Promise<number>;
  getTotalCost(): Promise<number>;
  getUsageByModel(model: string): Promise<{ tokens: number; cost: number }>;
  setCostThreshold(userId: string, threshold: number): Promise<void>;
}
