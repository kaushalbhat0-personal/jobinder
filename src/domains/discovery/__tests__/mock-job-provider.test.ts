import { describe, it, expect } from 'vitest';
import { MockJobProvider } from '../providers/mock-job-provider';

describe('MockJobProvider', () => {
  const provider = new MockJobProvider();

  it('has name "mock"', () => {
    expect(provider.name).toBe('mock');
  });

  it('fetchJobs returns 8 sample jobs', async () => {
    const result = await provider.fetchJobs();
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.length).toBe(8);
    expect(result.value[0]!.title).toBeDefined();
    expect(result.value[0]!.company).toBeDefined();
  });

  it('searchJobs filters by title', async () => {
    const result = await provider.searchJobs('Software');
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.every((j) => j.title.toLowerCase().includes('software'))).toBe(true);
  });

  it('searchJobs filters by company', async () => {
    const result = await provider.searchJobs('TechCorp');
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.every((j) => j.company === 'TechCorp')).toBe(true);
  });

  it('searchJobs filters by skill', async () => {
    const result = await provider.searchJobs('TypeScript');
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.some((j) => j.skills.includes('TypeScript'))).toBe(true);
  });

  it('getJobById returns matching job', async () => {
    const result = await provider.getJobById('mock-job-1');
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value).not.toBeNull();
    expect(result.value!.title).toBe('Senior Software Engineer');
  });

  it('getJobById returns null for unknown id', async () => {
    const result = await provider.getJobById('nonexistent');
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value).toBeNull();
  });
});
