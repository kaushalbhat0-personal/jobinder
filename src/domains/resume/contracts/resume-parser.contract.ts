import type { Result } from '@/shared/core/result';
import type { ResumeSourceType } from './resume-upload.contract';

export interface ParsedResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  experience: number;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number | null;
  }>;
  rawText: string;
}

export interface ResumeParserContract {
  parse(content: string, sourceType: ResumeSourceType): Promise<Result<ParsedResumeData>>;
  supports(sourceType: ResumeSourceType): boolean;
}
