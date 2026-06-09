import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { ResumeRepository } from './resume-repository';
import { Resume } from '../entities/resume';
import { ResumeAnalysis } from '../entities/resume-analysis';
import { InfrastructureError } from '@/shared/core/errors';
import { createSupabaseBrowserClient } from '@/shared/lib/supabase/client';

export class SupabaseResumeRepository implements ResumeRepository {
  async findById(id: string): Promise<Resume | null> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.from('resumes').select('*').eq('id', id).single();

      if (error) return null;
      if (!data) return null;

      const result = Resume.create({
        id: data.id,
        userId: data.user_id,
        fileName: data.file_name,
        fileSize: data.file_size,
        fileType: data.file_type,
        content: data.content,
        status: data.status,
        version: data.version,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      });
      return result.isSuccess() ? result.value : null;
    } catch {
      return null;
    }
  }

  async findByUserId(userId: string): Promise<Resume | null> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      if (!data) return null;

      const result = Resume.create({
        id: data.id,
        userId: data.user_id,
        fileName: data.file_name,
        fileSize: data.file_size,
        fileType: data.file_type,
        content: data.content,
        status: data.status,
        version: data.version,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      });
      return result.isSuccess() ? result.value : null;
    } catch {
      return null;
    }
  }

  async save(resume: Resume): Promise<Result<Resume>> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.from('resumes').upsert({
        id: resume.id,
        user_id: resume.userId,
        file_name: resume.fileName,
        file_size: resume.fileSize,
        file_type: resume.fileType,
        content: resume.content,
        status: resume.status,
        version: resume.version,
        created_at: resume.createdAt.toISOString(),
        updated_at: resume.updatedAt.toISOString(),
      });

      if (error) return failure(new InfrastructureError(`Failed to save resume: ${error.message}`));

      return success(resume);
    } catch (err) {
      return failure(new InfrastructureError(`Failed to save resume: ${(err as Error).message}`));
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const supabase = createSupabaseBrowserClient();

      await supabase.from('resumes').delete().eq('id', id);

      await supabase.from('resume_analyses').delete().eq('resume_id', id);
    } catch {
      /* silent cleanup */
    }
  }

  async getAnalysis(resumeId: string): Promise<ResumeAnalysis | null> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      if (!data) return null;

      const result = ResumeAnalysis.create({
        id: data.id,
        resumeId: data.resume_id,
        skills: data.skills,
        experience: data.experience,
        suggestions: data.suggestions,
        summary: data.summary,
        score: data.score,
        model: data.model,
        createdAt: new Date(data.created_at),
      });
      return result.isSuccess() ? result.value : null;
    } catch {
      return null;
    }
  }

  async saveAnalysis(analysis: ResumeAnalysis): Promise<Result<ResumeAnalysis>> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.from('resume_analyses').insert({
        id: analysis.id,
        resume_id: analysis.resumeId,
        skills: analysis.skills,
        experience: analysis.experience,
        suggestions: analysis.suggestions,
        summary: analysis.summary,
        score: analysis.score,
        model: analysis.model,
        created_at: analysis.createdAt.toISOString(),
      });

      if (error)
        return failure(new InfrastructureError(`Failed to save analysis: ${error.message}`));

      return success(analysis);
    } catch (err) {
      return failure(new InfrastructureError(`Failed to save analysis: ${(err as Error).message}`));
    }
  }
}
