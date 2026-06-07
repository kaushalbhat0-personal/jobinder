import { describe, it, expect, vi } from 'vitest';
import { recordSwipeFeedback } from '../services/swipe-feedback.service';
import { eventBus } from '@/shared/events/event-bus';

describe('SwipeFeedbackService', () => {
  it('records like feedback and emits job:liked event', () => {
    const handler = vi.fn();
    eventBus.on('job:liked', handler);

    const feedback = recordSwipeFeedback('user-1', 'job-1', 'right', 90);
    expect(feedback.action).toBe('like');
    expect(feedback.userId).toBe('user-1');
    expect(feedback.jobId).toBe('job-1');
    expect(handler).toHaveBeenCalledWith({ userId: 'user-1', jobId: 'job-1', score: 90 });
  });

  it('records pass feedback and emits job:passed event', () => {
    const handler = vi.fn();
    eventBus.on('job:passed', handler);

    const feedback = recordSwipeFeedback('user-1', 'job-2', 'left', null);
    expect(feedback.action).toBe('pass');
    expect(handler).toHaveBeenCalledWith({ userId: 'user-1', jobId: 'job-2' });
  });

  it('records save feedback and emits job:saved event', () => {
    const handler = vi.fn();
    eventBus.on('job:saved', handler);

    const feedback = recordSwipeFeedback('user-1', 'job-3', 'save', 85);
    expect(feedback.action).toBe('save');
    expect(handler).toHaveBeenCalledWith({ userId: 'user-1', jobId: 'job-3', score: 85 });
  });

  it('records apply feedback and emits job:apply-intent event', () => {
    const handler = vi.fn();
    eventBus.on('job:apply-intent', handler);

    const feedback = recordSwipeFeedback('user-1', 'job-4', 'up', 95);
    expect(feedback.action).toBe('apply');
    expect(handler).toHaveBeenCalledWith({ userId: 'user-1', jobId: 'job-4', score: 95 });
  });
});
