import { describe, it, expect, beforeEach } from 'vitest';
import { RemotiveProvider } from '../providers/remotive-provider';

const mockResponse = JSON.stringify({
  'job-count': 1,
  'total-job-count': 1,
  jobs: [
    {
      id: 98765,
      url: 'https://remotive.com/remote-jobs/engineer-98765',
      title: 'Full Stack Developer',
      company_name: 'TechStartup',
      category: 'Software Development',
      tags: ['react', 'nodejs'],
      job_type: 'full_time',
      publication_date: new Date().toISOString(),
      salary: '$80k - $120k',
      candidate_required_location: 'Remote',
      description: 'Looking for a React and Node.js developer.',
    },
  ],
});

describe('RemotiveProvider', () => {
  let provider: RemotiveProvider;

  beforeEach(() => {
    provider = new RemotiveProvider();
    global.fetch = async () =>
      new Response(mockResponse, { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  it('returns NormalizedJob array', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0]!.title).toBe('Full Stack Developer');
    expect(jobs[0]!.company).toBe('TechStartup');
  });

  it('parses location', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs[0]!.location).toBe('Remote');
  });

  it('parses salary', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs[0]!.salaryMin).toBe(80000);
    expect(jobs[0]!.salaryMax).toBe(120000);
  });

  it('uses remotive source prefix', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs[0]!.id).toContain('remotive');
    expect(jobs[0]!.source).toBe('remotive');
  });

  it('includes tags in skills', async () => {
    const jobs = await provider.fetchJobs();
    expect(jobs[0]!.skills).toContain('react');
    expect(jobs[0]!.skills).toContain('nodejs');
  });

  it('returns empty array on fetch failure', async () => {
    global.fetch = async () => new Response(null, { status: 500 });
    const jobs = await provider.fetchJobs();
    expect(jobs).toEqual([]);
  });
});
