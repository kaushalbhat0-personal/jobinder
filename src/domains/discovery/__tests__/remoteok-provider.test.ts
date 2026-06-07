import { describe, it, expect, beforeEach } from 'vitest';
import { RemoteOkProvider } from '../providers/remoteok-provider';

const mockResponse = JSON.stringify([
  { last_updated: Date.now(), legal: 'test' },
  {
    id: '12345',
    epoch: Date.now() / 1000,
    date: new Date().toISOString(),
    company: 'Test &amp; Co',
    position: 'Senior Software Engineer',
    tags: ['javascript', 'react', 'full stack', '$150k - $200k'],
    description: 'We need a skilled JavaScript developer with React experience.',
    url: 'https://remoteok.com/job/12345',
  },
]);

describe('RemoteOkProvider', () => {
  let provider: RemoteOkProvider;

  beforeEach(() => {
    provider = new RemoteOkProvider();
    global.fetch = async () =>
      new Response(mockResponse, { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  it('returns NormalizedJob array', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0]!.title).toBe('Senior Software Engineer');
    expect(jobs[0]!.company).toBe('Test & Co');
  });

  it('parses salary from tags', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs[0]!.salaryMin).toBe(150000);
    expect(jobs[0]!.salaryMax).toBe(200000);
  });

  it('uses remoteok source prefix', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs[0]!.id).toContain('remoteok');
    expect(jobs[0]!.source).toBe('remoteok');
  });

  it('extracts skills from description', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs[0]!.skills).toContain('javascript');
    expect(jobs[0]!.skills).toContain('react');
  });

  it('returns empty array on fetch failure', async () => {
    global.fetch = async () => new Response(null, { status: 500 });
    const jobs = await provider.fetchJobs();
    expect(jobs).toEqual([]);
  });
});
