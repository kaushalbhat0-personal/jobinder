import type { UserFeedbackRepository } from './user-feedback-repository';
import type { UserFeedback } from '../entities/user-feedback';
import { createSupabaseBrowserClient } from '@/shared/lib/supabase/client';

export class SupabaseUserFeedbackRepository implements UserFeedbackRepository {
  async save(feedback: UserFeedback): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('user_feedback').upsert(
      {
        user_id: feedback.userId,
        job_id: feedback.jobId,
        action: feedback.action,
        created_at: feedback.createdAt.toISOString(),
      },
      { onConflict: 'user_id,job_id,action' },
    );

    if (error) throw error;
  }
}
