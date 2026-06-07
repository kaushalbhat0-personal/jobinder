import type { JobType } from './job';

export interface NormalizedJobData {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  skills: string[];
  description: string;
  source: string;
  sourceUrl: string;
  postedAt: Date;
}

export const QUALITY_MINIMUM = 60;

export class NormalizedJob {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly company: string,
    public readonly location: string | null,
    public readonly salaryMin: number | null,
    public readonly salaryMax: number | null,
    public readonly currency: string,
    public readonly skills: string[],
    public readonly description: string,
    public readonly source: string,
    public readonly sourceUrl: string,
    public readonly postedAt: Date,
    public readonly sources: string[],
  ) {}

  static create(data: NormalizedJobData): NormalizedJob {
    return new NormalizedJob(
      data.id,
      data.title,
      data.company,
      data.location,
      data.salaryMin,
      data.salaryMax,
      data.currency,
      data.skills,
      data.description,
      data.source,
      data.sourceUrl,
      data.postedAt,
      [data.source],
    );
  }

  mergeSource(other: NormalizedJob): NormalizedJob {
    const merged = [...new Set([...this.sources, ...other.sources])];
    return new NormalizedJob(
      this.id,
      this.title,
      this.company,
      this.location ?? other.location,
      this.salaryMin ?? other.salaryMin,
      this.salaryMax ?? other.salaryMax,
      this.currency,
      [...new Set([...this.skills, ...other.skills])],
      this.description || other.description,
      this.source,
      this.sourceUrl || other.sourceUrl,
      this.postedAt < other.postedAt ? this.postedAt : other.postedAt,
      merged,
    );
  }

  toJobType(): JobType {
    return 'full-time';
  }

  hasSalary(): boolean {
    return this.salaryMin != null || this.salaryMax != null;
  }

  daysSincePosted(): number {
    const now = Date.now();
    const diff = now - this.postedAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  isRecent(days = 30): boolean {
    return this.daysSincePosted() <= days;
  }
}
