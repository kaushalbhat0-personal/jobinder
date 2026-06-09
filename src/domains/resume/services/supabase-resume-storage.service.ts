import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { ResumeStorageContract } from '../contracts/resume-storage.contract';
import type { ParsedResumeData } from '../contracts/resume-parser.contract';
import { NotFoundError, InfrastructureError } from '@/shared/core/errors';
import { createSupabaseBrowserClient } from '@/shared/lib/supabase/client';

export class SupabaseResumeStorageService implements ResumeStorageContract {
  async storeFile(userId: string, resumeId: string, content: string): Promise<Result<string>> {
    try {
      if (!resumeId) return failure(new InfrastructureError('resumeId is required'));
      if (!userId) return failure(new InfrastructureError('userId is required'));

      const supabase = createSupabaseBrowserClient();
      const storagePath = `${userId}/${resumeId}.txt`;

      const { error } = await supabase.storage
        .from('resumes')
        .upload(storagePath, content, { upsert: true });

      if (error) return failure(new InfrastructureError(`Failed to store file: ${error.message}`));

      return success(storagePath);
    } catch (err) {
      return failure(new InfrastructureError(`Failed to store file: ${(err as Error).message}`));
    }
  }

  async retrieveFile(userId: string, resumeId: string): Promise<Result<string>> {
    try {
      if (!userId) return failure(new InfrastructureError('userId is required'));

      const supabase = createSupabaseBrowserClient();
      const storagePath = `${userId}/${resumeId}.txt`;

      const { data, error } = await supabase.storage.from('resumes').download(storagePath);

      if (error) return failure(new NotFoundError(`File not found: ${resumeId}`));

      const text = await data.text();
      return success(text);
    } catch (err) {
      return failure(new InfrastructureError(`Failed to retrieve file: ${(err as Error).message}`));
    }
  }

  async storeParsedData(resumeId: string, parsedData: ParsedResumeData): Promise<Result<void>> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from('resume_parsed_data')
        .upsert({ resume_id: resumeId, data: parsedData, updated_at: new Date().toISOString() });

      if (error)
        return failure(new InfrastructureError(`Failed to store parsed data: ${error.message}`));

      return success(undefined);
    } catch (err) {
      return failure(
        new InfrastructureError(`Failed to store parsed data: ${(err as Error).message}`),
      );
    }
  }

  async retrieveParsedData(resumeId: string): Promise<Result<ParsedResumeData | null>> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('resume_parsed_data')
        .select('data')
        .eq('resume_id', resumeId)
        .single();

      if (error && (error as { code?: string }).code !== 'PGRST116')
        return failure(new InfrastructureError(`Failed to retrieve parsed data: ${error.message}`));
      if (!data) return success(null);

      return success(data.data as ParsedResumeData);
    } catch (err) {
      return failure(
        new InfrastructureError(`Failed to retrieve parsed data: ${(err as Error).message}`),
      );
    }
  }

  async storeProfileSnapshot(userId: string, data: ParsedResumeData): Promise<Result<void>> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from('resume_profile_snapshots')
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });

      if (error)
        return failure(
          new InfrastructureError(`Failed to store profile snapshot: ${error.message}`),
        );

      return success(undefined);
    } catch (err) {
      return failure(
        new InfrastructureError(`Failed to store profile snapshot: ${(err as Error).message}`),
      );
    }
  }

  async retrieveProfileSnapshot(userId: string): Promise<Result<ParsedResumeData | null>> {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('resume_profile_snapshots')
        .select('data')
        .eq('user_id', userId)
        .single();

      if (error && (error as { code?: string }).code !== 'PGRST116')
        return failure(
          new InfrastructureError(`Failed to retrieve profile snapshot: ${error.message}`),
        );
      if (!data) return success(null);

      return success(data.data as ParsedResumeData);
    } catch (err) {
      return failure(
        new InfrastructureError(`Failed to retrieve profile snapshot: ${(err as Error).message}`),
      );
    }
  }

  async deleteFile(userId: string, resumeId: string): Promise<Result<void>> {
    try {
      if (!userId) return failure(new InfrastructureError('userId is required'));

      const supabase = createSupabaseBrowserClient();
      const storagePath = `${userId}/${resumeId}.txt`;

      const { error } = await supabase.storage.from('resumes').remove([storagePath]);

      if (error) return failure(new InfrastructureError(`Failed to delete file: ${error.message}`));

      return success(undefined);
    } catch (err) {
      return failure(new InfrastructureError(`Failed to delete file: ${(err as Error).message}`));
    }
  }
}
