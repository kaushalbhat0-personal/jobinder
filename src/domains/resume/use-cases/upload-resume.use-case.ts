import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError, InfrastructureError } from '@/shared/core/errors';
import type { ResumeRepository } from '../repositories/resume-repository';
import type { ResumeStorageContract } from '../contracts/resume-storage.contract';
import type { ResumeParserContract, ParsedResumeData } from '../contracts/resume-parser.contract';
import { FileReaderService, type FileReadResult } from '../services/file-reader.service';
import { Resume } from '../entities/resume';
import { emitResumeEvent } from '../events/resume-events';
import { track } from '@/shared/analytics/track';

export interface UploadResumeResult {
  resume: Resume;
  parsedData: ParsedResumeData;
  storagePath: string;
}

export class UploadResumeUseCase {
  constructor(
    private readonly fileReader: FileReaderService,
    private readonly storage: ResumeStorageContract,
    private readonly parser: ResumeParserContract,
    private readonly resumeRepo: ResumeRepository,
  ) {}

  async execute(userId: string, file: File): Promise<Result<UploadResumeResult>> {
    if (!userId) return failure(new ValidationError('User id is required'));
    if (!file) return failure(new ValidationError('File is required'));

    let readResult: FileReadResult;
    try {
      const result = await this.fileReader.readAsText(file);
      if (result.isFailure()) return failure(result.error);
      readResult = result.value;
    } catch (err) {
      return failure(new InfrastructureError(`Failed to read file: ${(err as Error).message}`));
    }

    if (!this.parser.supports(readResult.sourceType)) {
      return failure(
        new ValidationError(`Parser does not support source type: ${readResult.sourceType}`),
      );
    }

    const resumeId =
      crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();

    const resumeResult = Resume.create({
      id: resumeId,
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: readResult.sourceType,
      content: null,
      status: 'uploading',
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    if (resumeResult.isFailure()) return failure(resumeResult.error);
    let resume = resumeResult.value;

    const storeResult = await this.storage.storeFile(userId, resumeId, readResult.content);
    if (storeResult.isFailure()) return failure(storeResult.error);
    const storagePath = storeResult.value;

    const parseResult = await this.parser.parse(readResult.content, readResult.sourceType);
    if (parseResult.isFailure()) return failure(parseResult.error);
    const parsedData = parseResult.value;

    await this.storage.storeParsedData(resumeId, parsedData);

    resume = resume.markUploaded(readResult.content);
    const saveResult = await this.resumeRepo.save(resume);
    if (saveResult.isFailure()) return failure(saveResult.error);

    try {
      emitResumeEvent('resume:uploaded', { userId, resumeId, version: resume.version });
      emitResumeEvent('resume:parsed', { userId, resumeId, version: resume.version });
    } catch {
      /* event emission is non-critical */
    }

    try {
      track('resume_uploaded', {
        userId,
        resumeId,
        fileType: readResult.sourceType,
        fileSize: file.size,
      });
    } catch {
      /* analytics is non-critical */
    }

    return success({ resume, parsedData, storagePath });
  }
}
