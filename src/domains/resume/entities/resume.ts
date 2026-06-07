import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type ResumeStatus =
  | 'pending'
  | 'uploading'
  | 'uploaded'
  | 'analyzing'
  | 'analyzed'
  | 'failed';

export interface ResumeData {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  content: string | null;
  status: ResumeStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Resume {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly fileType: string,
    public readonly content: string | null,
    public readonly status: ResumeStatus,
    public readonly version: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: ResumeData): Result<Resume> {
    if (!data.id) return failure(new ValidationError('Resume id is required'));
    if (!data.userId) return failure(new ValidationError('User id is required'));
    if (!data.fileName || data.fileName.trim().length === 0)
      return failure(new ValidationError('File name is required'));
    if (data.fileSize <= 0) return failure(new ValidationError('File size must be positive'));
    if (data.version < 1) return failure(new ValidationError('Version must be >= 1'));
    return success(
      new Resume(
        data.id,
        data.userId,
        data.fileName,
        data.fileSize,
        data.fileType,
        data.content,
        data.status,
        data.version,
        data.createdAt,
        data.updatedAt,
      ),
    );
  }

  markUploaded(content: string): Resume {
    return new Resume(
      this.id,
      this.userId,
      this.fileName,
      this.fileSize,
      this.fileType,
      content,
      'uploaded',
      this.version,
      this.createdAt,
      new Date(),
    );
  }

  markAnalyzed(): Resume {
    return new Resume(
      this.id,
      this.userId,
      this.fileName,
      this.fileSize,
      this.fileType,
      this.content,
      'analyzed',
      this.version,
      this.createdAt,
      new Date(),
    );
  }

  markFailed(): Resume {
    return new Resume(
      this.id,
      this.userId,
      this.fileName,
      this.fileSize,
      this.fileType,
      this.content,
      'failed',
      this.version,
      this.createdAt,
      new Date(),
    );
  }

  createNextVersion(): Resume {
    return new Resume(
      this.id,
      this.userId,
      this.fileName,
      this.fileSize,
      this.fileType,
      this.content,
      'pending',
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }
}
