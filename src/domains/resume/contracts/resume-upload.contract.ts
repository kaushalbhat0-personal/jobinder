import type { Result } from '@/shared/core/result';

export type ResumeSourceType = 'pdf' | 'docx';

export interface ResumeUploadInput {
  userId: string;
  fileName: string;
  fileSize: number;
  sourceType: ResumeSourceType;
  content: string;
}

export interface ResumeUploadResult {
  resumeId: string;
  storagePath: string;
  version: number;
}

export interface ResumeUploadContract {
  validate(input: ResumeUploadInput): Promise<Result<ResumeUploadInput>>;
  upload(input: ResumeUploadInput): Promise<Result<ResumeUploadResult>>;
  getSupportedTypes(): ResumeSourceType[];
}
