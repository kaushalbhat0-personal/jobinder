export type AnalyticsEvent =
  | 'resume_uploaded'
  | 'resume_analyzed'
  | 'job_liked'
  | 'job_disliked'
  | 'job_applied'
  | 'referral_requested'
  | 'user_signed_up'
  | 'user_signed_in'
  | 'user_signed_out'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'feed_generated'
  | 'profile_updated'
  | 'preferences_changed'
  | 'resume_confirmed'
  | 'resume_analysis_started'
  | 'resume_analysis_completed'
  | 'resume_analysis_failed'
  | 'feed_generation_started'
  | 'feed_refreshed'
  | 'job_match_generated'
  | 'job_passed'
  | 'job_saved'
  | 'job_apply_intent'
  | 'application_created'
  | 'application_stage_changed'
  | 'interview_received'
  | 'offer_received';

export type AnalyticsProperties = Record<string, string | number | boolean | undefined>;

export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  console.log(`[Analytics] ${event}`, properties ?? '');
}
