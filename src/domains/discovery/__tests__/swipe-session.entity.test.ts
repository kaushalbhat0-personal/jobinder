import { describe, it, expect } from 'vitest';
import { SwipeSession } from '../entities/swipe-session';
import { UserFeedback } from '../entities/user-feedback';

function createSession() {
  return SwipeSession.create({
    id: 'session-1',
    userId: 'user-1',
    status: 'active',
    actions: [],
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
  }).getOrThrow();
}

describe('SwipeSession entity', () => {
  it('creates with valid data', () => {
    const result = SwipeSession.create({
      id: 'session-1',
      userId: 'user-1',
      status: 'active',
      actions: [],
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
    });
    expect(result.isSuccess()).toBe(true);
  });

  it('records a like action', () => {
    const after = createSession().recordAction('job-1', 'right', 90);
    expect(after.actions).toHaveLength(1);
    expect(after.getLikeCount()).toBe(1);
  });

  it('records a pass action', () => {
    const after = createSession().recordAction('job-1', 'left', null);
    expect(after.getPassCount()).toBe(1);
  });

  it('records a save action', () => {
    const after = createSession().recordAction('job-1', 'save', 85);
    expect(after.getSaveCount()).toBe(1);
  });

  it('records an apply action', () => {
    const after = createSession().recordAction('job-1', 'up', 90);
    expect(after.getApplyCount()).toBe(1);
  });

  it('tracks all counts independently', () => {
    const after = createSession()
      .recordAction('j1', 'right', 90)
      .recordAction('j2', 'left', null)
      .recordAction('j3', 'save', 85)
      .recordAction('j4', 'up', 95)
      .recordAction('j5', 'right', 80);

    expect(after.getLikeCount()).toBe(2);
    expect(after.getPassCount()).toBe(1);
    expect(after.getSaveCount()).toBe(1);
    expect(after.getApplyCount()).toBe(1);
    expect(after.actions).toHaveLength(5);
  });

  it('completes a session', () => {
    const completed = createSession().complete();
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).not.toBeNull();
  });

  it('undoLastAction removes the last action', () => {
    const after = createSession()
      .recordAction('j1', 'right', 90)
      .recordAction('j2', 'left', null)
      .recordAction('j3', 'save', 85);

    expect(after.actions).toHaveLength(3);

    const undone = after.undoLastAction();
    expect(undone.actions).toHaveLength(2);
    expect(undone.getSaveCount()).toBe(0);
    expect(undone.getLikeCount()).toBe(1);
    expect(undone.getPassCount()).toBe(1);
  });

  it('undoLastAction on empty session returns empty', () => {
    const undone = createSession().undoLastAction();
    expect(undone.actions).toHaveLength(0);
  });

  it('UserFeedback can be created for each swipe action', () => {
    const feedback = new UserFeedback('user-1', 'job-1', 'like', new Date());
    expect(feedback.userId).toBe('user-1');
    expect(feedback.jobId).toBe('job-1');
    expect(feedback.action).toBe('like');
  });
});
