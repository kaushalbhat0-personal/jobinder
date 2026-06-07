import { eventBus } from '@/shared/events/event-bus';

export const AIEventTypes = {
  UsageReported: 'ai:usage-reported',
  CostThresholdReached: 'ai:cost-threshold-reached',
} as const;

export interface UsageReportedPayload {
  userId: string;
  tokensUsed: number;
  cost: number;
  model: string;
}
export interface CostThresholdReachedPayload {
  userId: string;
  threshold: number;
  currentCost: number;
}

export type AIEventPayloads = {
  [AIEventTypes.UsageReported]: UsageReportedPayload;
  [AIEventTypes.CostThresholdReached]: CostThresholdReachedPayload;
};

export function emitAIEvent<K extends keyof AIEventPayloads & string>(
  type: K,
  payload: AIEventPayloads[K],
): void {
  eventBus.emit(type as never, payload as never);
}
