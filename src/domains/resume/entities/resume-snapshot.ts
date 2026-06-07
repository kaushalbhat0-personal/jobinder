import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';
import type { ParsedResumeData } from '../contracts/resume-parser.contract';

export interface ResumeSnapshotData {
  id: string;
  resumeId: string;
  version: number;
  snapshot: ParsedResumeData;
  createdAt: Date;
}

export class ResumeSnapshot {
  private constructor(
    public readonly id: string,
    public readonly resumeId: string,
    public readonly version: number,
    public readonly snapshot: ParsedResumeData,
    public readonly createdAt: Date,
  ) {}

  static create(data: ResumeSnapshotData): Result<ResumeSnapshot> {
    if (!data.id) return failure(new ValidationError('Snapshot id is required'));
    if (!data.resumeId) return failure(new ValidationError('Resume id is required'));
    if (data.version < 1) return failure(new ValidationError('Version must be >= 1'));
    if (!data.snapshot) return failure(new ValidationError('Snapshot data is required'));
    return success(
      new ResumeSnapshot(data.id, data.resumeId, data.version, data.snapshot, data.createdAt),
    );
  }
}
