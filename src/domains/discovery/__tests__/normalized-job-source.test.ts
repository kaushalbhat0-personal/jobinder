import { describe, it, expect } from 'vitest';
import { NormalizedJobSource } from '../entities/normalized-job-source';

describe('NormalizedJobSource', () => {
  it('creates with default health metrics', () => {
    const s = NormalizedJobSource.create('remoteok');
    expect(s.source).toBe('remoteok');
    expect(s.successRate).toBe(100);
    expect(s.avgQualityScore).toBe(0);
    expect(s.errorRate).toBe(0);
    expect(s.totalRuns).toBe(0);
    expect(s.lastSync).toBeNull();
  });

  it('recordSync updates success rate on success', () => {
    const s = NormalizedJobSource.create('remoteok');
    s.recordSync(true, 75);
    expect(s.totalRuns).toBe(1);
    expect(s.successRate).toBe(100);
    expect(s.errorRate).toBe(0);
    expect(s.avgQualityScore).toBe(75);
    expect(s.lastSync).toBeInstanceOf(Date);
  });

  it('recordSync updates error rate on failure', () => {
    const s = NormalizedJobSource.create('remoteok');
    s.recordSync(false, 0);
    expect(s.totalRuns).toBe(1);
    expect(s.successRate).toBe(0);
    expect(s.errorRate).toBe(100);
  });

  it('recordSync accumulates across multiple runs', () => {
    const s = NormalizedJobSource.create('remoteok');
    s.recordSync(true, 80);
    s.recordSync(true, 90);
    s.recordSync(false, 0);
    expect(s.totalRuns).toBe(3);
    expect(s.successRate).toBe(67);
    expect(s.errorRate).toBe(33);
    expect(s.avgQualityScore).toBe(0);
  });

  it('snapshot returns immutable data', () => {
    const s = NormalizedJobSource.create('remoteok');
    s.recordSync(true, 85);
    const snap = s.snapshot();
    expect(snap.source).toBe('remoteok');
    expect(snap.successRate).toBe(100);
    expect(snap.avgQualityScore).toBe(85);
  });
});
