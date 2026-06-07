import type { Resume } from '../entities/resume';
import type { ResumeAnalysis } from '../entities/resume-analysis';
import type { Result } from '@/shared/core/result';

export interface ResumeRepository {
  findById(id: string): Promise<Resume | null>;
  findByUserId(userId: string): Promise<Resume | null>;
  save(resume: Resume): Promise<Result<Resume>>;
  delete(id: string): Promise<void>;
  getAnalysis(resumeId: string): Promise<ResumeAnalysis | null>;
  saveAnalysis(analysis: ResumeAnalysis): Promise<Result<ResumeAnalysis>>;
}
