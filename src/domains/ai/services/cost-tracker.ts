import type { AIUsageRecord } from '../entities/ai-usage';

export class AICostTracker {
  private records: AIUsageRecord[] = [];

  async record(usage: Omit<AIUsageRecord, 'id' | 'timestamp'>): Promise<void> {
    const record: AIUsageRecord = {
      ...usage,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    this.records.push(record);
  }

  async getUserCost(userId: string): Promise<number> {
    return this.records.filter((r) => r.userId === userId).reduce((sum, r) => sum + r.cost, 0);
  }

  getRecords(): AIUsageRecord[] {
    return this.records;
  }

  clear(): void {
    this.records = [];
  }
}
