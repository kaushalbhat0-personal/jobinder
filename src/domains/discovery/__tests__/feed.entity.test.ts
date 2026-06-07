import { describe, it, expect } from 'vitest';
import { Feed } from '../entities/feed';
import { FeedItem } from '../entities/feed-item';

function jobItem(jobId: string, score: number, reason: string): FeedItem {
  return new FeedItem(jobId, 'job', score, { jobId, reason });
}

describe('Feed entity', () => {
  it('creates with valid data', () => {
    const result = Feed.create({
      id: 'feed-1',
      userId: 'user-1',
      items: [jobItem('job-1', 90, 'good match')],
      cursor: null,
      hasMore: false,
      generatedAt: new Date(),
      createdAt: new Date(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.items).toHaveLength(1);
    }
  });

  it('fails when id is empty', () => {
    const result = Feed.create({
      id: '',
      userId: 'user-1',
      items: [],
      cursor: null,
      hasMore: false,
      generatedAt: new Date(),
      createdAt: new Date(),
    });
    expect(result.isFailure()).toBe(true);
  });

  it('appends items', () => {
    const result = Feed.create({
      id: 'feed-1',
      userId: 'user-1',
      items: [],
      cursor: 'abc',
      hasMore: true,
      generatedAt: new Date(),
      createdAt: new Date(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const appended = result.value.append([jobItem('job-2', 80, 'match')], null, false);
      expect(appended.items).toHaveLength(1);
      expect(appended.hasMore).toBe(false);
      expect(appended.cursor).toBeNull();
    }
  });

  it('removes items by id', () => {
    const result = Feed.create({
      id: 'feed-1',
      userId: 'user-1',
      items: [jobItem('job-1', 90, 'a'), jobItem('job-2', 80, 'b')],
      cursor: null,
      hasMore: false,
      generatedAt: new Date(),
      createdAt: new Date(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const removed = result.value.remove('job-1');
      expect(removed.items).toHaveLength(1);
      expect(removed.items[0]?.id).toBe('job-2');
    }
  });
});
