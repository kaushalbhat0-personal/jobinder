import type { NormalizedJob } from '../entities/normalized-job';

export interface NormalizedJobProvider {
  readonly name: string;
  fetchJobs(): Promise<NormalizedJob[]>;
}
