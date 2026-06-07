import { describe, it, expect } from 'vitest';
import { FeedGeneration } from '../entities/feed-generation';

describe('FeedGeneration', () => {
  const validData = {
    id: 'fg-1',
    userId: 'user-1',
    jobCount: 0,
    source: 'manual' as const,
    status: 'pending' as const,
    createdAt: new Date('2026-06-07'),
    completedAt: null,
    error: null,
  };

  it('creates a FeedGeneration with valid data', () => {
    const result = FeedGeneration.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.id).toBe('fg-1');
    expect(result.value.status).toBe('pending');
  });

  it('fails when id is empty', () => {
    const result = FeedGeneration.create({ ...validData, id: '' });
    expect(result.isSuccess()).toBe(false);
  });

  it('fails when userId is empty', () => {
    const result = FeedGeneration.create({ ...validData, userId: '' });
    expect(result.isSuccess()).toBe(false);
  });

  it('fails when jobCount is negative', () => {
    const result = FeedGeneration.create({ ...validData, jobCount: -1 });
    expect(result.isSuccess()).toBe(false);
  });

  it('complete() sets status to completed', () => {
    const gen = FeedGeneration.create(validData).getOrThrow();
    const completed = gen.complete(5);
    expect(completed.status).toBe('completed');
    expect(completed.jobCount).toBe(5);
    expect(completed.completedAt).toBeInstanceOf(Date);
  });

  it('fail() sets status to failed', () => {
    const gen = FeedGeneration.create(validData).getOrThrow();
    const failed = gen.fail('Something went wrong');
    expect(failed.status).toBe('failed');
    expect(failed.error).toBe('Something went wrong');
    expect(failed.completedAt).toBeInstanceOf(Date);
  });
});
