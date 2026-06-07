import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { ResumeRepository } from '../repositories/resume-repository';
import type { Resume } from '../entities/resume';
import { NotFoundError } from '@/shared/core/errors';

export class GetResumeUseCase {
  constructor(private readonly resumeRepo: ResumeRepository) {}

  async execute(userId: string): Promise<Result<Resume>> {
    const resume = await this.resumeRepo.findByUserId(userId);
    if (!resume) return failure(new NotFoundError('Resume not found'));
    return success(resume);
  }
}
