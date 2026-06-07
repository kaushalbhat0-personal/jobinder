export type { ResumeStatus } from '../entities/resume';
export type {
  AnalysisSkill,
  AnalysisSuggestion,
  AnalysisSuggestion as Suggestion,
} from '../entities/resume-analysis';
export type ResumeFileInput = {
  fileName: string;
  fileSize: number;
  fileType: string;
  content: string;
};
export type ResumeVersionInfo = { version: number; createdAt: Date; status: string };
