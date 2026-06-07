import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus } from '@/shared/events/event-bus';

describe('Event Bus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('emits events to subscribers', () => {
    const handler = vi.fn();
    eventBus.on('job:liked', handler);
    eventBus.emit('job:liked', { userId: 'u1', jobId: 'j1', score: 0.9 });

    expect(handler).toHaveBeenCalledWith({ userId: 'u1', jobId: 'j1', score: 0.9 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('allows unsubscribing', () => {
    const handler = vi.fn();
    eventBus.on('job:disliked', handler);
    eventBus.off('job:disliked', handler);
    eventBus.emit('job:disliked', { userId: 'u1', jobId: 'j1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple subscribers', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    eventBus.on('resume:uploaded', handler1);
    eventBus.on('resume:uploaded', handler2);
    eventBus.emit('resume:uploaded', { userId: 'u1', resumeId: 'r1' });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('returns unsubscribe function from on()', () => {
    const handler = vi.fn();
    const unsubscribe = eventBus.on('application:submitted', handler);
    unsubscribe();
    eventBus.emit('application:submitted', { userId: 'u1', jobId: 'j1', applicationId: 'a1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('handles events with no subscribers without error', () => {
    expect(() => {
      eventBus.emit('referral:requested', { userId: 'u1', referralId: 'r1', jobId: 'j1' });
    }).not.toThrow();
  });

  it('clear removes all handlers', () => {
    const handler = vi.fn();
    eventBus.on('job:liked', handler);
    eventBus.clear();
    eventBus.emit('job:liked', { userId: 'u1', jobId: 'j1', score: 0.8 });

    expect(handler).not.toHaveBeenCalled();
  });
});
