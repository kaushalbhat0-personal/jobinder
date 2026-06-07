import type { Result } from '@/shared/core/result';
import type { ParsedResumeData } from './resume-parser.contract';
import type { AnalysisSuggestion } from '../entities/resume-analysis';

export interface ResumeAnalysisInput {
  profileData: ParsedResumeData;
  userId: string;
}

export interface ResumeAnalysisResult {
  score: number;
  suggestions: AnalysisSuggestion[];
  missingSkills: string[];
  recommendedRoles: string[];
}

export interface ResumeAnalysisContract {
  analyze(input: ResumeAnalysisInput): Promise<Result<ResumeAnalysisResult>>;
  scoreResume(profileData: ParsedResumeData): Promise<Result<number>>;
  suggestImprovements(profileData: ParsedResumeData): Promise<Result<AnalysisSuggestion[]>>;
  identifyMissingSkills(profileData: ParsedResumeData): Promise<Result<string[]>>;
  recommendRoles(profileData: ParsedResumeData): Promise<Result<string[]>>;
}
