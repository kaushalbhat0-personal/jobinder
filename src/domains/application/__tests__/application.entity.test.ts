import { describe, it, expect } from 'vitest';
import { Application } from '../entities/application';

function makeApp(overrides: Partial<Parameters<typeof Application.create>[0]> = {}) {
  return Application.create({
    id: 'app-1',
    userId: 'user-1',
    jobId: 'job-1',
    company: 'TestCorp',
    role: 'Software Engineer',
    stage: 'saved',
    appliedDate: new Date('2026-01-15'),
    lastUpdated: new Date('2026-01-15'),
    ...overrides,
  });
}

describe('Application entity', () => {
  describe('create', () => {
    it('creates an application with given data', () => {
      const app = makeApp();
      expect(app.id).toBe('app-1');
      expect(app.userId).toBe('user-1');
      expect(app.company).toBe('TestCorp');
      expect(app.role).toBe('Software Engineer');
      expect(app.stage).toBe('saved');
    });
  });

  describe('isTerminal', () => {
    it('returns true for rejected', () => {
      expect(makeApp({ stage: 'rejected' }).isTerminal()).toBe(true);
    });

    it('returns true for withdrawn', () => {
      expect(makeApp({ stage: 'withdrawn' }).isTerminal()).toBe(true);
    });

    it('returns true for offer', () => {
      expect(makeApp({ stage: 'offer' }).isTerminal()).toBe(true);
    });

    it('returns false for active stages', () => {
      expect(makeApp({ stage: 'applied' }).isTerminal()).toBe(false);
      expect(makeApp({ stage: 'interview' }).isTerminal()).toBe(false);
    });
  });

  describe('isActive', () => {
    it('returns opposite of isTerminal', () => {
      expect(makeApp({ stage: 'saved' }).isActive()).toBe(true);
      expect(makeApp({ stage: 'rejected' }).isActive()).toBe(false);
    });
  });

  describe('isInterview', () => {
    it('returns true for interview stages', () => {
      expect(makeApp({ stage: 'interview' }).isInterview()).toBe(true);
      expect(makeApp({ stage: 'technical' }).isInterview()).toBe(true);
      expect(makeApp({ stage: 'final' }).isInterview()).toBe(true);
    });

    it('returns false for non-interview stages', () => {
      expect(makeApp({ stage: 'saved' }).isInterview()).toBe(false);
      expect(makeApp({ stage: 'offer' }).isInterview()).toBe(false);
    });
  });

  describe('transitionTo', () => {
    it('creates a new instance with updated stage and lastUpdated', () => {
      const app = makeApp();
      const updated = app.transitionTo('applied');
      expect(updated.stage).toBe('applied');
      expect(updated.lastUpdated.getTime()).toBeGreaterThan(app.lastUpdated.getTime());
      expect(updated.id).toBe(app.id);
    });
  });

  describe('canTransitionTo', () => {
    it('allows forward transitions', () => {
      const app = makeApp({ stage: 'applied' });
      expect(app.canTransitionTo('screening')).toBe(true);
    });

    it('rejects same stage', () => {
      const app = makeApp({ stage: 'applied' });
      expect(app.canTransitionTo('applied')).toBe(false);
    });

    it('rejects transitions from terminal stages', () => {
      const rejected = makeApp({ stage: 'rejected' });
      expect(rejected.canTransitionTo('applied')).toBe(false);
    });
  });
});
