import type { NormalizedJob } from '../entities/normalized-job';

export interface QualityScore {
  total: number;
  breakdown: {
    hasSalary: number;
    hasDescription: number;
    isRecent: number;
    hasCompany: number;
    hasSkills: number;
  };
}

export function scoreJob(job: NormalizedJob): QualityScore {
  const hasSalary = job.hasSalary() ? 25 : 0;
  const hasDescription = job.description.length > 50 ? 20 : job.description.length > 0 ? 10 : 0;
  const isRecent = job.isRecent(30) ? 20 : job.isRecent(90) ? 10 : 0;
  const hasCompany = job.company.length > 0 ? 15 : 0;
  const hasSkills = job.skills.length >= 3 ? 20 : job.skills.length > 0 ? 10 : 0;

  const total = hasSalary + hasDescription + isRecent + hasCompany + hasSkills;

  return {
    total,
    breakdown: { hasSalary, hasDescription, isRecent, hasCompany, hasSkills },
  };
}

export function isQualityJob(job: NormalizedJob, minimum = 60): boolean {
  return scoreJob(job).total >= minimum;
}

export function filterQualityJobs(jobs: NormalizedJob[], minimum = 60): NormalizedJob[] {
  return jobs.filter((j) => isQualityJob(j, minimum));
}

export function sortByQuality(jobs: NormalizedJob[]): NormalizedJob[] {
  return [...jobs].sort((a, b) => scoreJob(b).total - scoreJob(a).total);
}
