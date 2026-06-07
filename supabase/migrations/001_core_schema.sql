-- ============================================================================
-- Migration 001: Core Database Schema
-- JOBinder - Complete Supabase Database Layer
-- ============================================================================
-- Apply order:
--   Part 1: Extensions
--   Part 2: Profiles
--   Part 3: Resumes + Analysis + Snapshots
--   Part 4: Jobs + Matches
--   Part 5: Applications + Referrals
--   Part 6: Feeds + Discovery
--   Part 7: AI Infrastructure
--   Part 8: Feedback + User Actions
--   Part 9: RLS Policies
--   Part 10: Storage
--   Part 11: Indexes
-- ============================================================================

-- ============================================================================
-- PART 1: Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 2: Profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  experience INTEGER NOT NULL DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  career_stage TEXT CHECK (career_stage IN ('student', 'fresher', 'experienced')),
  target_roles TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT uq_profiles_user_id UNIQUE (user_id),
  CONSTRAINT chk_profiles_salary_range CHECK (
    expected_salary_min IS NULL
    OR expected_salary_max IS NULL
    OR expected_salary_min <= expected_salary_max
  ),
  CONSTRAINT chk_profiles_experience CHECK (experience >= 0)
);

COMMENT ON TABLE profiles IS 'User profiles with career preferences and onboarding data';
COMMENT ON COLUMN profiles.career_stage IS 'student | fresher | experienced';

-- ============================================================================
-- PART 3: Resumes + Analysis + Snapshots
-- ============================================================================

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'uploading', 'uploaded', 'analyzing', 'analyzed', 'failed')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT chk_resumes_file_size CHECK (file_size > 0),
  CONSTRAINT chk_resumes_version CHECK (version >= 1)
);

COMMENT ON TABLE resumes IS 'Uploaded resume files and their processing status';
COMMENT ON COLUMN resumes.status IS 'pending | uploading | uploaded | analyzing | analyzed | failed';

CREATE TABLE IF NOT EXISTS resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL,
  skills JSONB NOT NULL DEFAULT '[]',
  experience INTEGER NOT NULL DEFAULT 0,
  suggestions JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_resume_analyses_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT chk_resume_analyses_score CHECK (score >= 0 AND score <= 100),
  CONSTRAINT chk_resume_analyses_experience CHECK (experience >= 0)
);

COMMENT ON TABLE resume_analyses IS 'AI-generated resume analysis results';
COMMENT ON COLUMN resume_analyses.skills IS 'Array of {name, level, relevance} objects';
COMMENT ON COLUMN resume_analyses.suggestions IS 'Array of {category, message, priority} objects';
COMMENT ON COLUMN resume_analyses.score IS 'ATS score 0-100';

CREATE TABLE IF NOT EXISTS resume_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_resume_snapshots_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT chk_resume_snapshots_version CHECK (version >= 1),
  CONSTRAINT uq_resume_snapshots_version UNIQUE (resume_id, version)
);

COMMENT ON TABLE resume_snapshots IS 'Versioned snapshots of parsed resume data for comparison';

CREATE TABLE IF NOT EXISTS resume_analysis_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL,
  snapshot_version INTEGER NOT NULL,
  skills JSONB NOT NULL DEFAULT '[]',
  experience INTEGER NOT NULL DEFAULT 0,
  suggestions JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_resume_analysis_versions_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT chk_resume_analysis_versions_score CHECK (score >= 0 AND score <= 100),
  CONSTRAINT chk_resume_analysis_versions_experience CHECK (experience >= 0),
  CONSTRAINT chk_resume_analysis_versions_snapshot_version CHECK (snapshot_version >= 1)
);

COMMENT ON TABLE resume_analysis_versions IS 'Versioned analysis results tied to specific resume snapshot versions';

CREATE TABLE IF NOT EXISTS resume_parsed_data (
  resume_id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_resume_parsed_data_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE
);

COMMENT ON TABLE resume_parsed_data IS 'Cached parsed resume data for quick access';

CREATE TABLE IF NOT EXISTS resume_profile_snapshots (
  user_id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_resume_profile_snapshots_user FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE resume_profile_snapshots IS 'Cached profile snapshot used for resume analysis';

-- ============================================================================
-- PART 4: Jobs + Matches
-- ============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT,
  type TEXT NOT NULL DEFAULT 'full-time'
    CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'closed', 'draft')),
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  skills TEXT[] DEFAULT '{}',
  experience_required INTEGER NOT NULL DEFAULT 0,
  application_url TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_jobs_experience_required CHECK (experience_required >= 0),
  CONSTRAINT chk_jobs_salary_range CHECK (
    salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max
  )
);

COMMENT ON TABLE jobs IS 'Aggregated job listings from external providers';
COMMENT ON COLUMN jobs.type IS 'full-time | part-time | contract | internship';
COMMENT ON COLUMN jobs.status IS 'active | paused | closed | draft';

CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  reasons TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  gaps TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_job_matches_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_matches_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT chk_job_matches_score CHECK (score >= 0 AND score <= 100),
  CONSTRAINT uq_job_matches UNIQUE (job_id, user_id)
);

COMMENT ON TABLE job_matches IS 'Calculated match scores between users and jobs';

CREATE TABLE IF NOT EXISTS job_sync_runs (
  run_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  jobs_fetched INTEGER NOT NULL DEFAULT 0,
  jobs_accepted INTEGER NOT NULL DEFAULT 0,
  jobs_rejected INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

COMMENT ON TABLE job_sync_runs IS 'Tracking individual job provider sync runs for monitoring';

CREATE TABLE IF NOT EXISTS normalized_job_sources (
  source TEXT PRIMARY KEY,
  success_rate INTEGER NOT NULL DEFAULT 100,
  last_sync TIMESTAMPTZ,
  avg_quality_score INTEGER NOT NULL DEFAULT 0,
  error_rate INTEGER NOT NULL DEFAULT 0,
  total_runs INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT chk_job_sources_success_rate CHECK (success_rate >= 0 AND success_rate <= 100),
  CONSTRAINT chk_job_sources_error_rate CHECK (error_rate >= 0 AND error_rate <= 100)
);

COMMENT ON TABLE normalized_job_sources IS 'Health and quality tracking for each job provider source';

-- ============================================================================
-- PART 5: Applications + Referrals
-- ============================================================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id TEXT NOT NULL,
  resume_id UUID,
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'saved'
    CHECK (stage IN ('saved', 'applied', 'screening', 'interview', 'technical', 'final', 'offer', 'rejected', 'withdrawn')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'reviewing', 'interview', 'offered', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  notes TEXT,
  applied_date TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

COMMENT ON TABLE applications IS 'Job applications tracking both discovery and tracker domains';
COMMENT ON COLUMN applications.stage IS 'saved | applied | screening | interview | technical | final | offer | rejected | withdrawn';
COMMENT ON COLUMN applications.status IS 'draft | submitted | reviewing | interview | offered | accepted | rejected | withdrawn';

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id TEXT NOT NULL,
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_referrals_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT chk_referrals_email CHECK (referrer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE referrals IS 'Job referral requests sent by users to their network';

-- ============================================================================
-- PART 6: Feeds + Discovery
-- ============================================================================

CREATE TABLE IF NOT EXISTS feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  cursor TEXT,
  has_more BOOLEAN NOT NULL DEFAULT false,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_feeds_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE feeds IS 'Generated job feeds with pagination cursor for each user';
COMMENT ON COLUMN feeds.items IS 'Array of FeedItem {id, type, score, payload} objects';

CREATE TABLE IF NOT EXISTS feed_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'auto'
    CHECK (source IN ('manual', 'auto', 'refresh')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT fk_feed_generations_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT chk_feed_generations_job_count CHECK (job_count >= 0)
);

COMMENT ON TABLE feed_generations IS 'Log of feed generation runs for each user';
COMMENT ON COLUMN feed_generations.source IS 'manual | auto | refresh';

CREATE TABLE IF NOT EXISTS swipe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  actions JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_swipe_sessions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE swipe_sessions IS 'Swipe-based job discovery sessions';
COMMENT ON COLUMN swipe_sessions.actions IS 'Array of SwipeAction {jobId, direction, score, timestamp}';

-- ============================================================================
-- PART 7: AI Infrastructure
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  pricing JSONB NOT NULL DEFAULT '{"inputPer1K": 0, "outputPer1K": 0, "currency": "USD"}',
  context_window INTEGER NOT NULL,
  max_output_tokens INTEGER NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT chk_ai_models_context_window CHECK (context_window > 0),
  CONSTRAINT chk_ai_models_max_tokens CHECK (max_output_tokens > 0)
);

COMMENT ON TABLE ai_models IS 'Registered AI models with capabilities and pricing';
COMMENT ON COLUMN ai_models.capabilities IS 'Array of capability strings: chat, stream, embed, vision, reasoning';
COMMENT ON COLUMN ai_models.pricing IS '{inputPer1K, outputPer1K, currency}';

CREATE TABLE IF NOT EXISTS ai_prompts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('analysis', 'generation', 'matching', 'extraction', 'summary')),
  template TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  variables TEXT[] DEFAULT '{}',
  model TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ai_prompts_version CHECK (version >= 1)
);

COMMENT ON TABLE ai_prompts IS 'Prompt templates for AI operations with versioning';
COMMENT ON COLUMN ai_prompts.category IS 'analysis | generation | matching | extraction | summary';

CREATE TABLE IF NOT EXISTS ai_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  endpoint TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_code TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_ai_usage_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE ai_usage_records IS 'Per-request AI usage telemetry for cost tracking and monitoring';

-- ============================================================================
-- PART 8: Feedback + User Actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id TEXT NOT NULL,
  action TEXT NOT NULL
    CHECK (action IN ('like', 'pass', 'save', 'apply')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_feedback_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_feedback UNIQUE (user_id, job_id, action)
);

COMMENT ON TABLE user_feedback IS 'User swipe/action feedback on jobs for recommendation learning';
COMMENT ON COLUMN user_feedback.action IS 'like | pass | save | apply';

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE feedback IS 'General user feedback and bug reports';

-- ============================================================================
-- PART 9: Row Level Security
-- ============================================================================

-- Profiles: users access only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Resumes: users access only their own
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resumes_select_own" ON resumes FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "resumes_insert_own" ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_update_own" ON resumes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_delete_own" ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Resume Analyses: access via resume ownership
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_analyses_select_own" ON resume_analyses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_analyses.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_analyses_insert_own" ON resume_analyses FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_analyses.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_analyses_delete_own" ON resume_analyses FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_analyses.resume_id AND resumes.user_id = auth.uid())
  );

-- Resume Snapshots: access via resume ownership
ALTER TABLE resume_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_snapshots_select_own" ON resume_snapshots FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_snapshots.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_snapshots_insert_own" ON resume_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_snapshots.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_snapshots_delete_own" ON resume_snapshots FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_snapshots.resume_id AND resumes.user_id = auth.uid())
  );

-- Resume Analysis Versions: access via resume ownership
ALTER TABLE resume_analysis_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_analysis_versions_select_own" ON resume_analysis_versions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_analysis_versions.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_analysis_versions_insert_own" ON resume_analysis_versions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_analysis_versions.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_analysis_versions_delete_own" ON resume_analysis_versions FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_analysis_versions.resume_id AND resumes.user_id = auth.uid())
  );

-- Resume Parsed Data: access via resume ownership
ALTER TABLE resume_parsed_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_parsed_data_select_own" ON resume_parsed_data FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_parsed_data.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_parsed_data_insert_own" ON resume_parsed_data FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_parsed_data.resume_id AND resumes.user_id = auth.uid())
  );
CREATE POLICY "resume_parsed_data_update_own" ON resume_parsed_data FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_parsed_data.resume_id AND resumes.user_id = auth.uid())
  );

-- Resume Profile Snapshots: users access only their own
ALTER TABLE resume_profile_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_profile_snapshots_select_own" ON resume_profile_snapshots FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "resume_profile_snapshots_insert_own" ON resume_profile_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resume_profile_snapshots_update_own" ON resume_profile_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Jobs: publicly readable (aggregated from external providers)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_select_all" ON jobs FOR SELECT
  USING (true);
CREATE POLICY "jobs_insert_service" ON jobs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "jobs_update_service" ON jobs FOR UPDATE
  USING (auth.role() = 'service_role');
CREATE POLICY "jobs_delete_service" ON jobs FOR DELETE
  USING (auth.role() = 'service_role');

-- Job Matches: users access only their own
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_matches_select_own" ON job_matches FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "job_matches_insert_own" ON job_matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "job_matches_delete_own" ON job_matches FOR DELETE
  USING (auth.uid() = user_id);

-- Job Sync Runs: service only
ALTER TABLE job_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_sync_runs_select_service" ON job_sync_runs FOR SELECT
  USING (auth.role() = 'service_role');
CREATE POLICY "job_sync_runs_insert_service" ON job_sync_runs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "job_sync_runs_update_service" ON job_sync_runs FOR UPDATE
  USING (auth.role() = 'service_role');

-- Normalized Job Sources: service only
ALTER TABLE normalized_job_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "normalized_job_sources_select_service" ON normalized_job_sources FOR SELECT
  USING (auth.role() = 'service_role');
CREATE POLICY "normalized_job_sources_insert_service" ON normalized_job_sources FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "normalized_job_sources_update_service" ON normalized_job_sources FOR UPDATE
  USING (auth.role() = 'service_role');

-- Applications: users access only their own
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select_own" ON applications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "applications_update_own" ON applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "applications_delete_own" ON applications FOR DELETE
  USING (auth.uid() = user_id);

-- Referrals: users access only their own
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_own" ON referrals FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "referrals_insert_own" ON referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "referrals_update_own" ON referrals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "referrals_delete_own" ON referrals FOR DELETE
  USING (auth.uid() = user_id);

-- Feeds: users access only their own
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feeds_select_own" ON feeds FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "feeds_insert_own" ON feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feeds_update_own" ON feeds FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feeds_delete_own" ON feeds FOR DELETE
  USING (auth.uid() = user_id);

-- Feed Generations: users access only their own
ALTER TABLE feed_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_generations_select_own" ON feed_generations FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "feed_generations_insert_own" ON feed_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed_generations_update_own" ON feed_generations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Swipe Sessions: users access only their own
ALTER TABLE swipe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swipe_sessions_select_own" ON swipe_sessions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "swipe_sessions_insert_own" ON swipe_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "swipe_sessions_update_own" ON swipe_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "swipe_sessions_delete_own" ON swipe_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- AI Models: publicly readable for model selection
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_models_select_all" ON ai_models FOR SELECT
  USING (true);
CREATE POLICY "ai_models_insert_service" ON ai_models FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "ai_models_update_service" ON ai_models FOR UPDATE
  USING (auth.role() = 'service_role');

-- AI Prompts: publicly readable (templates are not sensitive)
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_prompts_select_all" ON ai_prompts FOR SELECT
  USING (true);
CREATE POLICY "ai_prompts_insert_service" ON ai_prompts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "ai_prompts_update_service" ON ai_prompts FOR UPDATE
  USING (auth.role() = 'service_role');

-- AI Usage Records: users see their own, admins see all
ALTER TABLE ai_usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_records_select_own" ON ai_usage_records FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "ai_usage_records_insert_own" ON ai_usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Feedback: users access only their own
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_feedback_select_own" ON user_feedback FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "user_feedback_insert_own" ON user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_feedback_delete_own" ON user_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- General Feedback: users insert own, service reads all
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_own" ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feedback_select_own" ON feedback FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 10: Storage Bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload files to their own folder
CREATE POLICY "resumes_storage_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own files
CREATE POLICY "resumes_storage_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own files
CREATE POLICY "resumes_storage_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own files
CREATE POLICY "resumes_storage_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- PART 11: Indexes
-- ============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_target_roles ON profiles USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_locations ON profiles USING GIN(preferred_locations);

-- Resumes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);
CREATE INDEX IF NOT EXISTS idx_resumes_user_status ON resumes(user_id, status);

-- Resume Analyses
CREATE INDEX IF NOT EXISTS idx_resume_analyses_resume_id ON resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_score ON resume_analyses(score);

-- Resume Snapshots
CREATE INDEX IF NOT EXISTS idx_resume_snapshots_resume_id ON resume_snapshots(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_snapshots_version ON resume_snapshots(resume_id, version);

-- Resume Analysis Versions
CREATE INDEX IF NOT EXISTS idx_resume_analysis_versions_resume_id ON resume_analysis_versions(resume_id);

-- Resume Parsed Data
CREATE INDEX IF NOT EXISTS idx_resume_parsed_data_resume_id ON resume_parsed_data(resume_id);

-- Resume Profile Snapshots
CREATE INDEX IF NOT EXISTS idx_resume_profile_snapshots_user_id ON resume_profile_snapshots(user_id);

-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);

-- Job Matches
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_job_id ON job_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(score DESC);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_score ON job_matches(user_id, score DESC);

-- Job Sync Runs
CREATE INDEX IF NOT EXISTS idx_job_sync_runs_provider ON job_sync_runs(provider);
CREATE INDEX IF NOT EXISTS idx_job_sync_runs_started_at ON job_sync_runs(started_at DESC);

-- Applications
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_job_id ON referrals(job_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Feeds
CREATE INDEX IF NOT EXISTS idx_feeds_user_id ON feeds(user_id);

-- Feed Generations
CREATE INDEX IF NOT EXISTS idx_feed_generations_user_id ON feed_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_generations_status ON feed_generations(status);

-- Swipe Sessions
CREATE INDEX IF NOT EXISTS idx_swipe_sessions_user_id ON swipe_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_sessions_status ON swipe_sessions(status);

-- AI Usage
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON ai_usage_records(model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_timestamp ON ai_usage_records(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_timestamp ON ai_usage_records(user_id, timestamp DESC);

-- AI Prompts
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ai_prompts(is_active) WHERE is_active = true;

-- User Feedback
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_job_id ON user_feedback(job_id);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
