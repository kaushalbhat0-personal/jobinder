-- ============================================================================
-- Migration 002: Analytics Views
-- JOBinder - Pre-built analytics views for admin dashboard & user insights
-- ============================================================================
-- Usage:
--   SELECT * FROM user_dashboard_stats WHERE user_id = '...';
--   SELECT * FROM application_funnel;
--   SELECT * FROM resume_analysis_stats;
--   SELECT * FROM provider_health;
-- ============================================================================

-- ============================================================================
-- VIEW 1: user_dashboard_stats
-- Per-user aggregates for the admin dashboard and user profile page.
-- Shows each user's key metrics in a single row.
-- ============================================================================

CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
  p.id AS profile_id,
  p.user_id,
  p.name,
  p.career_stage,
  p.created_at AS user_since,

  -- Resume stats
  COALESCE(r_counts.total, 0) AS total_resumes,
  r_counts.latest_status AS latest_resume_status,
  r_counts.latest_version AS latest_resume_version,
  r_counts.last_uploaded AS last_resume_uploaded,

  -- Analysis stats
  COALESCE(a_counts.total, 0) AS total_analyses,
  a_counts.latest_score AS latest_analysis_score,
  a_counts.average_score AS avg_analysis_score,
  a_counts.last_analyzed AS last_analysis_date,

  -- Application stats
  COALESCE(app_counts.total, 0) AS total_applications,
  COALESCE(app_counts.active, 0) AS active_applications,
  app_counts.most_advanced_stage AS highest_application_stage,

  -- Feed stats
  COALESCE(f_counts.total, 0) AS total_feed_generations,
  COALESCE(f_counts.failed, 0) AS failed_feed_generations,

  -- AI usage
  COALESCE(ai.total_tokens, 0) AS total_ai_tokens,
  COALESCE(ai.total_cost, 0) AS total_ai_cost,
  COALESCE(ai.total_calls, 0) AS total_ai_calls,

  -- Feedback
  COALESCE(fb.total, 0) AS total_feedback_entries

FROM profiles p
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total,
    MAX(r.status) AS latest_status,
    MAX(r.version) AS latest_version,
    MAX(r.updated_at) AS last_uploaded
  FROM resumes r
  WHERE r.user_id = p.user_id
) r_counts ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total,
    MAX(ra.score) AS latest_score,
    ROUND(AVG(ra.score), 1) AS average_score,
    MAX(ra.created_at) AS last_analyzed
  FROM resume_analyses ra
  JOIN resumes r ON r.id = ra.resume_id
  WHERE r.user_id = p.user_id
) a_counts ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE a.stage NOT IN ('rejected', 'withdrawn', 'offer')) AS active,
    MAX(a.stage) AS most_advanced_stage
  FROM applications a
  WHERE a.user_id = p.user_id
) app_counts ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE fg.status = 'failed') AS failed
  FROM feed_generations fg
  WHERE fg.user_id = p.user_id
) f_counts ON true
LEFT JOIN LATERAL (
  SELECT
    COALESCE(SUM(au.total_tokens), 0)::BIGINT AS total_tokens,
    COALESCE(SUM(au.cost), 0)::NUMERIC(12, 6) AS total_cost,
    COUNT(*) AS total_calls
  FROM ai_usage_records au
  WHERE au.user_id = p.user_id
) ai ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS total
  FROM feedback fb
  WHERE fb.user_id = p.user_id
) fb ON true
ORDER BY p.created_at DESC;

COMMENT ON VIEW user_dashboard_stats IS 'Per-user aggregate dashboard stats including resumes, analyses, applications, feeds, AI usage, and feedback';

-- ============================================================================
-- VIEW 2: application_funnel
-- Funnel showing how many applications reach each stage.
-- Percentage is relative to total non-terminal applications.
-- ============================================================================

CREATE OR REPLACE VIEW application_funnel AS
WITH stage_order AS (
  SELECT 'saved' AS stage, 0 AS sort_order
  UNION SELECT 'applied', 1
  UNION SELECT 'screening', 2
  UNION SELECT 'interview', 3
  UNION SELECT 'technical', 4
  UNION SELECT 'final', 5
  UNION SELECT 'offer', 6
  UNION SELECT 'rejected', -1
  UNION SELECT 'withdrawn', -2
),
totals AS (
  SELECT COUNT(*) AS total_applications
  FROM applications
)
SELECT
  so.stage,
  so.sort_order,
  COUNT(a.id) AS count,
  CASE
    WHEN t.total_applications = 0 THEN 0
    ELSE ROUND(COUNT(a.id) * 100.0 / t.total_applications, 1)
  END AS percentage,
  ROUND(EXTRACT(EPOCH FROM AVG(a.updated_at - a.created_at)) / 3600, 1)::TEXT || 'h' AS avg_hours_in_stage
FROM stage_order so
LEFT JOIN applications a ON a.stage = so.stage
CROSS JOIN totals t
GROUP BY so.stage, so.sort_order, t.total_applications
ORDER BY so.sort_order DESC;

COMMENT ON VIEW application_funnel IS 'Application pipeline funnel showing count and percentage at each stage';

-- ============================================================================
-- VIEW 3: resume_analysis_stats
-- Aggregate statistics across all resume analyses.
-- Useful for understanding AI quality and user skill trends.
-- ============================================================================

CREATE OR REPLACE VIEW resume_analysis_stats AS
WITH score_buckets AS (
  SELECT
    CASE
      WHEN ra.score >= 90 THEN '90-100 (Excellent)'
      WHEN ra.score >= 75 THEN '75-89 (Good)'
      WHEN ra.score >= 50 THEN '50-74 (Average)'
      WHEN ra.score >= 25 THEN '25-49 (Below Average)'
      ELSE '0-24 (Needs Work)'
    END AS score_range,
    COUNT(*) AS count,
    ROUND(AVG(ra.score), 1) AS avg_score_in_range
  FROM resume_analyses ra
  GROUP BY score_range
),
skill_frequency AS (
  SELECT
    skill_obj ->> 'name' AS skill,
    COUNT(*) AS mention_count
  FROM resume_analyses ra,
  LATERAL jsonb_array_elements(ra.skills) AS skill_obj
  GROUP BY skill_obj ->> 'name'
  ORDER BY mention_count DESC
  LIMIT 20
)
SELECT
  -- Overview
  (SELECT COUNT(*) FROM resume_analyses) AS total_analyses,
  (SELECT COUNT(DISTINCT resume_id) FROM resume_analyses) AS unique_resumes_analyzed,
  (SELECT ROUND(AVG(score), 1) FROM resume_analyses) AS average_score,
  (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) FROM resume_analyses)::NUMERIC(5,1) AS median_score,
  (SELECT ROUND(AVG(experience), 1) FROM resume_analyses) AS average_experience_years,
  (SELECT MAX(score) FROM resume_analyses) AS highest_score,
  (SELECT MIN(score) FROM resume_analyses) AS lowest_score,
  (SELECT ROUND(STDDEV(score), 1) FROM resume_analyses) AS stddev_score,

  -- Models used
  (SELECT model FROM resume_analyses GROUP BY model ORDER BY COUNT(*) DESC LIMIT 1) AS most_used_model,
  (SELECT COUNT(DISTINCT model) FROM resume_analyses) AS unique_models_used,

  -- Score distribution
  (SELECT jsonb_object_agg(score_range, jsonb_build_object('count', count, 'avg_score', avg_score_in_range))
   FROM score_buckets) AS score_distribution,

  -- Top skills
  (SELECT jsonb_agg(jsonb_build_object('skill', skill, 'mentions', mention_count))
   FROM skill_frequency) AS top_skills,

  -- Recent activity
  (SELECT MAX(created_at) FROM resume_analyses) AS last_analysis_date,
  (SELECT COUNT(*) FROM resume_analyses WHERE created_at >= now() - interval '7 days') AS analyses_this_week;

COMMENT ON VIEW resume_analysis_stats IS 'Aggregate resume analysis metrics including score distribution, top skills, and model usage';

-- ============================================================================
-- VIEW 4: provider_health
-- Job provider sync health monitoring.
-- Shows success rates, error rates, and quality scores per provider.
-- ============================================================================

CREATE OR REPLACE VIEW provider_health AS
SELECT
  njs.source AS provider,
  njs.success_rate,
  njs.error_rate,
  njs.avg_quality_score,
  njs.total_runs,
  njs.last_sync,
  CASE
    WHEN njs.last_sync IS NULL THEN 'never_synced'
    WHEN njs.last_sync < now() - interval '24 hours' THEN 'stale'
    WHEN njs.last_sync < now() - interval '6 hours' THEN 'aging'
    ELSE 'healthy'
  END AS sync_status,
  CASE
    WHEN njs.success_rate >= 95 THEN 'excellent'
    WHEN njs.success_rate >= 85 THEN 'good'
    WHEN njs.success_rate >= 70 THEN 'degraded'
    ELSE 'critical'
  END AS health_rating,

  -- Most recent sync run detail
  last_run.jobs_fetched AS last_jobs_fetched,
  last_run.jobs_accepted AS last_jobs_accepted,
  last_run.jobs_rejected AS last_jobs_rejected,
  last_run.duration AS last_sync_duration_ms,
  last_run.started_at AS last_sync_started_at

FROM normalized_job_sources njs
LEFT JOIN LATERAL (
  SELECT jsr.jobs_fetched, jsr.jobs_accepted, jsr.jobs_rejected,
         jsr.duration, jsr.started_at
  FROM job_sync_runs jsr
  WHERE jsr.provider = njs.source
  ORDER BY jsr.started_at DESC
  LIMIT 1
) last_run ON true
ORDER BY njs.success_rate DESC;

COMMENT ON VIEW provider_health IS 'Job provider health monitoring with sync status, health rating, and latest run details';
