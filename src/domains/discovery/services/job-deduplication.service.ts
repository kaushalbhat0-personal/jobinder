import type { NormalizedJob } from '../entities/normalized-job';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function isDuplicate(a: NormalizedJob, b: NormalizedJob): boolean {
  const titleA = normalize(a.title);
  const titleB = normalize(b.title);
  const companyA = normalize(a.company);
  const companyB = normalize(b.company);

  const titleMatch = titleA === titleB || titleA.includes(titleB) || titleB.includes(titleA);
  const companyMatch =
    companyA === companyB || companyA.includes(companyB) || companyB.includes(companyA);

  return titleMatch && companyMatch;
}

export function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const unique: NormalizedJob[] = [];

  for (const job of jobs) {
    const existing = unique.find((u) => isDuplicate(u, job));
    if (existing) {
      const idx = unique.indexOf(existing);
      unique[idx] = existing.mergeSource(job);
    } else {
      unique.push(job);
    }
  }

  return unique;
}
