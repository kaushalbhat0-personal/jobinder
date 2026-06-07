import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SwipeUseCase } from '../use-cases/swipe.use-case';
import { InMemoryDiscoveryRepository } from '../repositories/in-memory-discovery-repository';
import { SwipeSession } from '../entities/swipe-session';
import { eventBus } from '@/shared/events/event-bus';

describe('SwipeUseCase', () => {
  let repo: InMemoryDiscoveryRepository;
  let useCase: SwipeUseCase;

  beforeEach(async () => {
    repo = new InMemoryDiscoveryRepository();
    useCase = new SwipeUseCase(repo);

    const session = SwipeSession.create({
      id: 'session-1',
      userId: 'user-1',
      status: 'active',
      actions: [],
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
    }).getOrThrow();
    await repo.saveSession(session);
  });

  it('records a like action and emits event', async () => {
    const handler = vi.fn();
    eventBus.on('job:liked', handler);

    const result = await useCase.execute('user-1', 'job-1', 'right', 90);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.getLikeCount()).toBe(1);
    expect(handler).toHaveBeenCalledWith({ userId: 'user-1', jobId: 'job-1', score: 90 });
  });

  it('records a pass action', async () => {
    const result = await useCase.execute('user-1', 'job-1', 'left', null);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.getPassCount()).toBe(1);
  });

  it('records a save action', async () => {
    const result = await useCase.execute('user-1', 'job-1', 'save', 85);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.getSaveCount()).toBe(1);
  });

  it('records an apply action', async () => {
    const result = await useCase.execute('user-1', 'job-1', 'up', 95);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.getApplyCount()).toBe(1);
  });

  it('fails when no active session exists', async () => {
    const result = await useCase.execute('user-999', 'job-1', 'right', 90);
    expect(result.isFailure()).toBe(true);
  });

  it('undo undoes the last action', async () => {
    await useCase.execute('user-1', 'job-1', 'right', 90);
    await useCase.execute('user-1', 'job-2', 'left', null);

    const session = await repo.getActiveSession('user-1');
    expect(session).not.toBeNull();
    expect(session!.actions).toHaveLength(2);

    const undone = session!.undoLastAction();
    expect(undone.actions).toHaveLength(1);
    expect(undone.getLikeCount()).toBe(1);
    expect(undone.getPassCount()).toBe(0);
  });
});
