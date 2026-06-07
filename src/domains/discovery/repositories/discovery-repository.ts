import type { Result } from '@/shared/core/result';
import type { Feed } from '../entities/feed';
import type { SwipeSession } from '../entities/swipe-session';

export interface DiscoveryRepository {
  getFeed(userId: string): Promise<Feed | null>;
  saveFeed(feed: Feed): Promise<Result<Feed>>;
  getActiveSession(userId: string): Promise<SwipeSession | null>;
  saveSession(session: SwipeSession): Promise<Result<SwipeSession>>;
}
