import type { Result } from '@/shared/core/result';
import type { ParsedResumeData } from './resume-parser.contract';

export interface ResumeStorageContract {
  storeFile(userId: string, resumeId: string, content: string): Promise<Result<string>>;
  retrieveFile(userId: string, resumeId: string): Promise<Result<string>>;
  storeParsedData(resumeId: string, data: ParsedResumeData): Promise<Result<void>>;
  retrieveParsedData(resumeId: string): Promise<Result<ParsedResumeData | null>>;
  storeProfileSnapshot(userId: string, data: ParsedResumeData): Promise<Result<void>>;
  retrieveProfileSnapshot(userId: string): Promise<Result<ParsedResumeData | null>>;
  deleteFile(userId: string, resumeId: string): Promise<Result<void>>;
}
