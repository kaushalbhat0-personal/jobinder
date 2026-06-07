import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import { NormalizedJob } from '../entities/normalized-job';

export interface WellfoundConfig {
  accessToken?: string;
  baseUrl?: string;
}

export class WellfoundProvider implements NormalizedJobProvider {
  readonly name = 'wellfound';
  private readonly config: WellfoundConfig;

  constructor(config: WellfoundConfig = {}) {
    this.config = config;
  }

  async fetchJobs(): Promise<NormalizedJob[]> {
    if (this.config.accessToken) {
      return this.fetchFromApi();
    }
    return [];
  }

  private async fetchFromApi(): Promise<NormalizedJob[]> {
    const baseUrl = this.config.baseUrl ?? 'https://api.angel.co/1';
    try {
      const response = await fetch(`${baseUrl}/jobs`, {
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return [];
      const data = (await response.json()) as {
        jobs?: Array<{ id: number; title: string; startups?: Array<{ name: string }> }>;
      };
      if (!data.jobs) return [];
      return data.jobs.map((job) =>
        NormalizedJob.create({
          id: `wellfound-${job.id}`,
          title: job.title,
          company: job.startups?.[0]?.name ?? 'Unknown',
          location: null,
          salaryMin: null,
          salaryMax: null,
          currency: 'USD',
          skills: [],
          description: '',
          source: this.name,
          sourceUrl: `https://wellfound.com/jobs/${job.id}`,
          postedAt: new Date(),
        }),
      );
    } catch {
      return [];
    }
  }
}
