import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeStore } from '../stores/resume-store';

describe('ResumeStore', () => {
  beforeEach(() => {
    useResumeStore.getState().reset();
  });

  it('initialises with null resume', () => {
    const state = useResumeStore.getState();
    expect(state.resume).toBeNull();
    expect(state.analysis).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('sets loading state', () => {
    useResumeStore.getState().setLoading(true);
    expect(useResumeStore.getState().isLoading).toBe(true);
  });

  it('resets correctly', () => {
    useResumeStore.getState().setError('err');
    useResumeStore.getState().reset();
    expect(useResumeStore.getState().error).toBeNull();
  });
});
