import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import type { NormalizedJob } from '../entities/normalized-job';

export class JobSourceRegistry {
  private providers = new Map<string, NormalizedJobProvider>();

  registerProvider(provider: NormalizedJobProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProviders(): NormalizedJobProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(name: string): NormalizedJobProvider | undefined {
    return this.providers.get(name);
  }

  async refreshProvider(name: string): Promise<NormalizedJob[]> {
    const provider = this.providers.get(name);
    if (!provider) return [];
    return provider.fetchJobs();
  }

  async fetchAll(): Promise<NormalizedJob[]> {
    const results = await Promise.all(this.getProviders().map((p) => p.fetchJobs()));
    return results.flat();
  }
}
