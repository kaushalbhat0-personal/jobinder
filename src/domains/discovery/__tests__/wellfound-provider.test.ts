import { describe, it, expect } from 'vitest';
import { WellfoundProvider } from '../providers/wellfound-provider';

describe('WellfoundProvider', () => {
  it('returns empty when no access token', async () => {
    const provider = new WellfoundProvider();
    const jobs = await provider.fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('attempts API call when token is present', async () => {
    const provider = new WellfoundProvider({ accessToken: 'test-token' });
    global.fetch = async () => new Response(JSON.stringify({ jobs: [] }), { status: 200 });

    const jobs = await provider.fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('handles network errors gracefully', async () => {
    const provider = new WellfoundProvider({ accessToken: 'test-token' });
    global.fetch = async () => {
      throw new Error('Network error');
    };

    const jobs = await provider.fetchJobs();
    expect(jobs).toEqual([]);
  });
});
