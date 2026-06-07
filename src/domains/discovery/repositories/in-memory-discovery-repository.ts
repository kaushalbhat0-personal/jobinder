import type { Result } from '@/shared/core/result';
import { success } from '@/shared/core/result';
import type { Feed } from '../entities/feed';
import type { SwipeSession } from '../entities/swipe-session';
import type { DiscoveryRepository } from './discovery-repository';
import type { Job } from '../entities/job';

export class InMemoryDiscoveryRepository implements DiscoveryRepository {
  private feeds = new Map<string, Feed>();
  private sessions = new Map<string, SwipeSession>();
  jobs: Job[] = [];

  async getFeed(userId: string): Promise<Feed | null> {
    return this.feeds.get(userId) ?? null;
  }

  async saveFeed(feed: Feed): Promise<Result<Feed>> {
    this.feeds.set(feed.userId, feed);
    return success(feed);
  }

  async getActiveSession(userId: string): Promise<SwipeSession | null> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.status === 'active') return session;
    }
    return null;
  }

  async saveSession(session: SwipeSession): Promise<Result<SwipeSession>> {
    this.sessions.set(session.id, session);
    return success(session);
  }
}
