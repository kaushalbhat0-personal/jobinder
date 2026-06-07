import type { Result } from '@/shared/core/result';
import { success } from '@/shared/core/result';
import type { ResumeRepository } from './resume-repository';
import type { Resume } from '../entities/resume';
import type { ResumeAnalysis } from '../entities/resume-analysis';

export class InMemoryResumeRepository implements ResumeRepository {
  private resumes = new Map<string, Resume>();
  private analyses = new Map<string, ResumeAnalysis>();

  async findById(id: string): Promise<Resume | null> {
    return this.resumes.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Resume | null> {
    for (const resume of this.resumes.values()) {
      if (resume.userId === userId) return resume;
    }
    return null;
  }

  async save(resume: Resume): Promise<Result<Resume>> {
    this.resumes.set(resume.id, resume);
    return success(resume);
  }

  async delete(id: string): Promise<void> {
    this.resumes.delete(id);
    this.analyses.delete(id);
  }

  async getAnalysis(resumeId: string): Promise<ResumeAnalysis | null> {
    return this.analyses.get(resumeId) ?? null;
  }

  async saveAnalysis(analysis: ResumeAnalysis): Promise<Result<ResumeAnalysis>> {
    this.analyses.set(analysis.resumeId, analysis);
    return success(analysis);
  }
}
