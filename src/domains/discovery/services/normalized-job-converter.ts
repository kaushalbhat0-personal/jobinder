import type { NormalizedJob } from '../entities/normalized-job';
import { Job } from '../entities/job';
import type { Result } from '@/shared/core/result';

export function normalizedJobToJob(normalized: NormalizedJob, feedSeed?: string): Result<Job> {
  return Job.create({
    id: feedSeed ? `feed-${feedSeed}-${normalized.id}` : normalized.id,
    title: normalized.title,
    company: normalized.company,
    description: normalized.description || 'No description provided',
    location: normalized.location,
    type: normalized.toJobType(),
    status: 'active',
    salaryMin: normalized.salaryMin,
    salaryMax: normalized.salaryMax,
    currency: normalized.currency,
    skills: normalized.skills,
    experienceRequired: 0,
    applicationUrl: normalized.sourceUrl,
    postedAt: normalized.postedAt,
    expiresAt: null,
    createdAt: normalized.postedAt,
    updatedAt: normalized.postedAt,
  });
}
