import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { ResumeStorageContract } from '../contracts/resume-storage.contract';
import type { ParsedResumeData } from '../contracts/resume-parser.contract';
import { NotFoundError, InfrastructureError } from '@/shared/core/errors';

interface StorageEntry {
  fileContent: string;
  parsedData: ParsedResumeData | null;
}

export class InMemoryResumeStorageService implements ResumeStorageContract {
  private files = new Map<string, StorageEntry>();
  private snapshots = new Map<string, ParsedResumeData>();

  async storeFile(_userId: string, resumeId: string, content: string): Promise<Result<string>> {
    try {
      if (!resumeId) return failure(new InfrastructureError('resumeId is required'));
      const existing = this.files.get(resumeId);
      this.files.set(resumeId, { fileContent: content, parsedData: existing?.parsedData ?? null });
      const storagePath = `resumes/${resumeId}.txt`;
      return success(storagePath);
    } catch (err) {
      return failure(new InfrastructureError(`Failed to store file: ${(err as Error).message}`));
    }
  }

  async retrieveFile(_userId: string, resumeId: string): Promise<Result<string>> {
    const entry = this.files.get(resumeId);
    if (!entry) return failure(new NotFoundError(`File not found: ${resumeId}`));
    return success(entry.fileContent);
  }

  async storeParsedData(resumeId: string, data: ParsedResumeData): Promise<Result<void>> {
    try {
      const existing = this.files.get(resumeId);
      this.files.set(resumeId, { fileContent: existing?.fileContent ?? '', parsedData: data });
      return success(undefined);
    } catch (err) {
      return failure(
        new InfrastructureError(`Failed to store parsed data: ${(err as Error).message}`),
      );
    }
  }

  async retrieveParsedData(resumeId: string): Promise<Result<ParsedResumeData | null>> {
    const entry = this.files.get(resumeId);
    return success(entry?.parsedData ?? null);
  }

  async storeProfileSnapshot(userId: string, data: ParsedResumeData): Promise<Result<void>> {
    try {
      this.snapshots.set(userId, data);
      return success(undefined);
    } catch (err) {
      return failure(
        new InfrastructureError(`Failed to store profile snapshot: ${(err as Error).message}`),
      );
    }
  }

  async retrieveProfileSnapshot(userId: string): Promise<Result<ParsedResumeData | null>> {
    const data = this.snapshots.get(userId);
    return success(data ?? null);
  }

  async deleteFile(_userId: string, resumeId: string): Promise<Result<void>> {
    this.files.delete(resumeId);
    return success(undefined);
  }
}
