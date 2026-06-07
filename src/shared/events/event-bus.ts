type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface EventMap {
  'resume:uploaded': { userId: string; resumeId: string };
  'resume:parsed': { userId: string; resumeId: string };
  'resume:analyzed': { userId: string; resumeId: string };
  'job:liked': { userId: string; jobId: string; score: number };
  'job:disliked': { userId: string; jobId: string };
  'referral:requested': { userId: string; referralId: string; jobId: string };
  'application:submitted': { userId: string; jobId: string; applicationId: string };
  'ai:usage-reported': { userId: string; tokensUsed: number; cost: number; model: string };
  'auth:user-signed-up': { userId: string; email: string };
  'auth:user-signed-in': { userId: string; email: string };
  'discovery:feed-generated': { userId: string; generationId: string; jobCount: number };
  'profile:updated': { userId: string; updatedFields: string[] };
  'profile:preferences-changed': { userId: string; preferences: Record<string, unknown> };
  'auth:user-signed-out': { userId: string };
  'ai:cost-threshold-reached': { userId: string; threshold: number; currentCost: number };
  'resume:version-created': { resumeId: string; version: number; reason: string };
  'resume:analysis-started': { userId: string; resumeId: string; snapshotVersion: number };
  'resume:analysis-completed': {
    userId: string;
    resumeId: string;
    snapshotVersion: number;
    score: number;
  };
  'resume:analysis-failed': {
    userId: string;
    resumeId: string;
    snapshotVersion: number;
    error: string;
  };
  'discovery:feed-generation-started': { userId: string; generationId: string };
  'discovery:feed-refresh-requested': { userId: string; generationId: string };
  'job:passed': { userId: string; jobId: string };
  'job:saved': { userId: string; jobId: string; score: number };
  'job:apply-intent': { userId: string; jobId: string; score: number };
  'application:created': {
    applicationId: string;
    userId: string;
    jobId: string;
    company: string;
    role: string;
    stage: string;
  };
  'application:updated': {
    applicationId: string;
    userId: string;
    jobId: string;
    previousStage: string;
    newStage: string;
  };
  'application:interview-received': {
    applicationId: string;
    userId: string;
    jobId: string;
    company: string;
    role: string;
  };
  'application:offer-received': {
    applicationId: string;
    userId: string;
    jobId: string;
    company: string;
    role: string;
  };
}

type EventName = keyof EventMap;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on<K extends EventName>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    const key = event as string;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(handler as EventHandler);

    return () => {
      this.off(event, handler);
    };
  }

  off<K extends EventName>(event: K, handler: EventHandler<EventMap[K]>): void {
    const key = event as string;
    this.handlers.get(key)?.delete(handler as EventHandler);
  }

  emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    const key = event as string;
    const handlers = this.handlers.get(key);
    if (handlers) {
      for (const handler of handlers) {
        handler(payload);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
