type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface EventMap {
  'resume:uploaded': { userId: string; resumeId: string };
  'resume:analyzed': { userId: string; resumeId: string };
  'job:liked': { userId: string; jobId: string; score: number };
  'job:disliked': { userId: string; jobId: string };
  'referral:requested': { userId: string; referralId: string; jobId: string };
  'application:submitted': { userId: string; jobId: string; applicationId: string };
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
