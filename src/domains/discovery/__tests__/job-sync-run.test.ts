import { describe, it, expect } from 'vitest';
import { JobSyncRun } from '../entities/job-sync-run';

describe('JobSyncRun', () => {
  it('starts with zero counters and no completion', () => {
    const run = JobSyncRun.start('remoteok');
    expect(run.provider).toBe('remoteok');
    expect(run.jobsFetched).toBe(0);
    expect(run.jobsAccepted).toBe(0);
    expect(run.jobsRejected).toBe(0);
    expect(run.duration).toBe(0);
    expect(run.completedAt).toBeNull();
    expect(run.runId).toContain('sync-remoteok');
  });

  it('complete sets counters and duration', async () => {
    const run = JobSyncRun.start('remotive');
    await new Promise((r) => setTimeout(r, 5));
    run.complete(100, 60, 40);

    expect(run.jobsFetched).toBe(100);
    expect(run.jobsAccepted).toBe(60);
    expect(run.jobsRejected).toBe(40);
    expect(run.completedAt).toBeInstanceOf(Date);
    expect(run.duration).toBeGreaterThan(0);
  });

  it('snapshot returns run data', () => {
    const run = JobSyncRun.start('test');
    run.complete(10, 7, 3);
    const snap = run.snapshot();
    expect(snap.provider).toBe('test');
    expect(snap.jobsFetched).toBe(10);
    expect(snap.jobsAccepted).toBe(7);
    expect(snap.jobsRejected).toBe(3);
    expect(snap.completedAt).toBeInstanceOf(Date);
  });
});
