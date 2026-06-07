import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';
import type { AnalysisSkill, AnalysisSuggestion } from './resume-analysis';

export interface ResumeAnalysisVersionData {
  id: string;
  resumeId: string;
  snapshotVersion: number;
  skills: AnalysisSkill[];
  experience: number;
  suggestions: AnalysisSuggestion[];
  summary: string;
  score: number;
  model: string;
  createdAt: Date;
}

export class ResumeAnalysisVersion {
  private constructor(
    public readonly id: string,
    public readonly resumeId: string,
    public readonly snapshotVersion: number,
    public readonly skills: AnalysisSkill[],
    public readonly experience: number,
    public readonly suggestions: AnalysisSuggestion[],
    public readonly summary: string,
    public readonly score: number,
    public readonly model: string,
    public readonly createdAt: Date,
  ) {}

  static create(data: ResumeAnalysisVersionData): Result<ResumeAnalysisVersion> {
    if (!data.id) return failure(new ValidationError('Analysis version id is required'));
    if (!data.resumeId) return failure(new ValidationError('Resume id is required'));
    if (data.snapshotVersion < 1)
      return failure(new ValidationError('Snapshot version must be >= 1'));
    if (data.score < 0 || data.score > 100)
      return failure(new ValidationError('Score must be between 0 and 100'));
    if (data.experience < 0) return failure(new ValidationError('Experience cannot be negative'));
    return success(
      new ResumeAnalysisVersion(
        data.id,
        data.resumeId,
        data.snapshotVersion,
        data.skills,
        data.experience,
        data.suggestions,
        data.summary,
        data.score,
        data.model,
        data.createdAt,
      ),
    );
  }

  getTopSkills(limit: number = 5): AnalysisSkill[] {
    return [...this.skills].sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  }

  getHighPrioritySuggestions(): AnalysisSuggestion[] {
    return this.suggestions.filter((s) => s.priority === 'high');
  }

  compareScore(other: ResumeAnalysisVersion): { previous: number; current: number; delta: number } {
    return {
      previous: other.score,
      current: this.score,
      delta: this.score - other.score,
    };
  }
}
