import type { Job } from '../entities/job';
import type { UserProfile } from '@/domains/profile/entities/user-profile';
import type { ResumeAnalysisResult } from '@/domains/ai/schemas/resume-analysis-schema';
import type { Result } from '@/shared/core/result';
import { success } from '@/shared/core/result';
import { JobMatch } from '../entities/job-match';

export interface MatchInput {
  job: Job;
  profile: UserProfile;
  analysis: ResumeAnalysisResult | null;
}

export interface MatchOutput {
  match: JobMatch;
}

function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function tokenize(s: string): Set<string> {
  return new Set(normalizeString(s).split(/\s+/).filter(Boolean));
}

function overlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const aLower = a.map((s) => normalizeString(s));
  const bLower = b.map((s) => normalizeString(s));
  const bSet = new Set(bLower);
  const matches = aLower.filter((s) => bSet.has(s));
  return matches.length / Math.max(a.length, b.length);
}

function salaryOverlap(
  jobMin: number | null,
  jobMax: number | null,
  profileMin: number | null,
  profileMax: number | null,
): number {
  if (jobMin == null && jobMax == null) return 0.5;
  if (profileMin == null && profileMax == null) return 0.5;
  const jMin = jobMin ?? 0;
  const jMax = jobMax ?? Infinity;
  const pMin = profileMin ?? 0;
  const pMax = profileMax ?? Infinity;
  const overlapMin = Math.max(jMin, pMin);
  const overlapMax = Math.min(jMax, pMax);
  if (overlapMin > overlapMax) return 0;
  const jRange = jMax === Infinity ? jMin * 0.5 : jMax - jMin;
  const oRange = overlapMax - overlapMin;
  return Math.min(1, oRange / (jRange || 1));
}

export class JobMatchingService {
  calculate(input: MatchInput): Result<MatchOutput> {
    const { job, profile, analysis } = input;
    const reasons: string[] = [];
    const strengths: string[] = [];
    const gaps: string[] = [];

    let roleScore = 0;
    let skillsScore = 0;
    let locationScore = 0;
    let salaryScore = 0;

    const roleWeight = 0.4;
    const skillsWeight = 0.3;
    const locationWeight = 0.15;
    const salaryWeight = 0.15;

    const jobTitleTokens = tokenize(job.title);
    const roleTokens = profile.targetRoles.map((r) => tokenize(r));

    if (profile.targetRoles.length > 0 && roleTokens.length > 0) {
      let bestOverlap = 0;
      for (const rt of roleTokens) {
        const intersection = new Set([...rt].filter((x) => jobTitleTokens.has(x)));
        const union = new Set([...rt, ...jobTitleTokens]);
        const jaccard = union.size > 0 ? intersection.size / union.size : 0;
        if (jaccard > bestOverlap) bestOverlap = jaccard;
      }
      roleScore = Math.round(bestOverlap * 100);
      if (roleScore >= 30) {
        reasons.push(`Role matches your target: ${job.title}`);
      }
    } else {
      roleScore = 50;
    }

    const targetSkills = [...new Set([...profile.skills, ...(analysis?.missingSkills ?? [])])];
    const jobSkills = job.skills;
    const skillOverlap = overlap(targetSkills, jobSkills);
    skillsScore = Math.round(skillOverlap * 100);

    const matchedSkills = jobSkills.filter((s) =>
      profile.skills.some((ps) => normalizeString(ps) === normalizeString(s)),
    );
    const missingSkills = jobSkills.filter(
      (s) => !profile.skills.some((ps) => normalizeString(ps) === normalizeString(s)),
    );

    if (matchedSkills.length > 0) {
      strengths.push(...matchedSkills.slice(0, 3).map((s) => `${s} experience`));
      reasons.push(...matchedSkills.slice(0, 2).map((s) => `✓ ${s} experience`));
    }
    if (missingSkills.length > 0) {
      gaps.push(...missingSkills);
    }

    const jobLoc = job.location ? normalizeString(job.location) : '';
    const remote = job.location?.toLowerCase().includes('remote') ?? false;

    if (remote) {
      locationScore = 100;
      if (profile.preferredLocations.length > 0) {
        reasons.push('Remote position available');
      }
    } else if (profile.preferredLocations.length > 0 && jobLoc) {
      const matched = profile.preferredLocations.some((pl) => {
        const loc = normalizeString(pl);
        return jobLoc.includes(loc) || loc.includes(jobLoc);
      });
      locationScore = matched ? 100 : 0;
      if (matched) {
        reasons.push(`Location matches your preference: ${job.location}`);
      } else if (profile.preferredLocations.length > 0) {
        gaps.push(`Located in ${job.location}, not in your preferred locations`);
      }
    } else {
      locationScore = 50;
    }

    salaryScore = Math.round(
      salaryOverlap(
        job.salaryMin,
        job.salaryMax,
        profile.expectedSalaryMin,
        profile.expectedSalaryMax,
      ) * 100,
    );
    if (salaryScore > 0 && profile.expectedSalaryMin != null) {
      reasons.push(`Salary range aligns with your expectations`);
    }

    const totalScore = Math.round(
      roleScore * roleWeight +
        skillsScore * skillsWeight +
        locationScore * locationWeight +
        salaryScore * salaryWeight,
    );

    const matchId = `match-${job.id}-${profile.userId}-${Date.now()}`;

    const match = JobMatch.create({
      id: matchId,
      jobId: job.id,
      userId: profile.userId,
      score: totalScore,
      reasons,
      strengths,
      gaps,
      createdAt: new Date(),
    }).getOrThrow();

    return success({ match });
  }
}
