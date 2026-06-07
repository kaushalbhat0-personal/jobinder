import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';
import { FeedItem } from './feed-item';

export interface FeedData {
  id: string;
  userId: string;
  items: FeedItem[];
  cursor: string | null;
  hasMore: boolean;
  generatedAt: Date;
  createdAt: Date;
}

export class Feed {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: FeedItem[],
    public readonly cursor: string | null,
    public readonly hasMore: boolean,
    public readonly generatedAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(data: FeedData): Result<Feed> {
    if (!data.id) return failure(new ValidationError('Feed id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    return success(
      new Feed(
        data.id,
        data.userId,
        data.items,
        data.cursor,
        data.hasMore,
        data.generatedAt,
        data.createdAt,
      ),
    );
  }

  append(items: FeedItem[], cursor: string | null, hasMore: boolean): Feed {
    return new Feed(
      this.id,
      this.userId,
      [...this.items, ...items],
      cursor,
      hasMore,
      this.generatedAt,
      this.createdAt,
    );
  }

  remove(itemId: string): Feed {
    return new Feed(
      this.id,
      this.userId,
      this.items.filter((i) => i.id !== itemId),
      this.cursor,
      this.hasMore,
      this.generatedAt,
      this.createdAt,
    );
  }
}
