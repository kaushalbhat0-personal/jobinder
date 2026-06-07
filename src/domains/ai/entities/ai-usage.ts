export interface AIUsageRecord {
  id: string;
  userId: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  endpoint: string;
  success: boolean;
  errorCode?: string;
  timestamp: Date;
}
