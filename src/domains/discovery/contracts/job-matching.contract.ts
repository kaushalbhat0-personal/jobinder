import type { Job } from '../entities/job';
import type { UserProfile } from '@/domains/profile/entities/user-profile';
import type { ResumeAnalysisResult } from '@/domains/ai/schemas/resume-analysis-schema';
import type { Result } from '@/shared/core/result';
import type { JobMatch } from '../entities/job-match';

export interface MatchInput {
  job: Job;
  profile: UserProfile;
  analysis: ResumeAnalysisResult | null;
}

export interface MatchOutput {
  match: JobMatch;
}

export interface JobMatchingContract {
  calculate(input: MatchInput): Promise<Result<MatchOutput>>;
  batchCalculate(inputs: MatchInput[]): Promise<Result<MatchOutput[]>>;
}
