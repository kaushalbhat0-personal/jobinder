import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { ResumeRepository } from '../repositories/resume-repository';
import type { ResumeAnalysis } from '../entities/resume-analysis';
import { NotFoundError } from '@/shared/core/errors';

export class GetAnalysisUseCase {
  constructor(private readonly resumeRepo: ResumeRepository) {}

  async execute(resumeId: string): Promise<Result<ResumeAnalysis>> {
    const analysis = await this.resumeRepo.getAnalysis(resumeId);
    if (!analysis) return failure(new NotFoundError('Analysis not found'));
    return success(analysis);
  }
}
