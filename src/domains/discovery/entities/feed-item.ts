export type FeedItemType = 'job' | 'referral' | 'mentor' | 'network' | 'recruiter';

export interface FeedItemData {
  id: string;
  type: FeedItemType;
  score: number;
  payload: Record<string, unknown>;
}

export class FeedItem {
  constructor(
    public readonly id: string,
    public readonly type: FeedItemType,
    public readonly score: number,
    public readonly payload: Record<string, unknown>,
  ) {}
}
