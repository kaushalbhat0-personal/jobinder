export interface DiscoveryRepository {
  getFeed(userId: string): Promise<unknown[]>;
  swipe(userId: string, jobId: string, direction: string): Promise<void>;
}
