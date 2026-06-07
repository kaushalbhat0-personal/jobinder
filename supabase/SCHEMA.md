# JOBinder Database Schema

## Overview

21 tables across 6 functional domains. Every table with a `user_id` column enforces Row Level Security (RLS) so users can only access their own data.

---

## ER Diagram

```
auth.users
  │
  ├── profiles                          (1:1, user_id FK)
  ├── resume_profile_snapshots          (1:1, user_id FK)
  ├── resumes                           (1:N, user_id FK)
  │     ├── resume_analyses             (1:N, resume_id FK)
  │     ├── resume_snapshots            (1:N, resume_id FK)
  │     ├── resume_analysis_versions    (1:N, resume_id FK)
  │     ├── resume_parsed_data          (1:1, resume_id FK)
  │     └── applications                (optional FK)
  ├── job_matches                       (1:N, user_id FK)
  ├── applications                      (1:N, user_id FK)
  ├── referrals                         (1:N, user_id FK)
  ├── feeds                             (1:N, user_id FK)
  ├── feed_generations                  (1:N, user_id FK)
  ├── swipe_sessions                    (1:N, user_id FK)
  ├── ai_usage_records                  (1:N, user_id FK)
  ├── user_feedback                     (1:N, user_id FK)
  └── feedback                          (1:N, user_id FK)

jobs (standalone, no user FK)
  └── job_matches                       (1:N, job_id FK)
  └── applications                      (1:N, job_id FK)
  └── referrals                         (1:N, job_id FK)

job_sync_runs (standalone)
normalized_job_sources (standalone)
ai_models (standalone, no user FK)
ai_prompts (standalone, no user FK)
```

---

## Tables

### 1. `profiles`

User profiles with career preferences and onboarding data.

| Column              | Type        | Constraints                           | Description         |
| ------------------- | ----------- | ------------------------------------- | ------------------- |
| id                  | UUID        | PK, default gen_random_uuid()         |                     |
| user_id             | UUID        | NOT NULL, UNIQUE, FK → auth.users(id) |                     |
| name                | TEXT        | NOT NULL                              |                     |
| headline            | TEXT        |                                       |                     |
| bio                 | TEXT        |                                       |                     |
| avatar_url          | TEXT        |                                       |                     |
| location            | TEXT        |                                       |                     |
| skills              | TEXT[]      | default '{}'                          |                     |
| experience          | INTEGER     | NOT NULL, default 0, >= 0             | Years of experience |
| preferences         | JSONB       | default '{}'                          |                     |
| career_stage        | TEXT        | CHECK (student,fresher,experienced)   |                     |
| target_roles        | TEXT[]      | default '{}'                          |                     |
| preferred_locations | TEXT[]      | default '{}'                          |                     |
| expected_salary_min | INTEGER     |                                       |                     |
| expected_salary_max | INTEGER     | CHECK (min <= max if both set)        |                     |
| created_at          | TIMESTAMPTZ | NOT NULL, default now()               |                     |
| updated_at          | TIMESTAMPTZ | NOT NULL, default now()               |                     |

### 2. `resumes`

Uploaded resume files with processing status.

| Column     | Type        | Constraints                                                                               | Description        |
| ---------- | ----------- | ----------------------------------------------------------------------------------------- | ------------------ |
| id         | UUID        | PK, default gen_random_uuid()                                                             |                    |
| user_id    | UUID        | NOT NULL, FK → auth.users(id)                                                             |                    |
| file_name  | TEXT        | NOT NULL                                                                                  |                    |
| file_size  | BIGINT      | NOT NULL, > 0                                                                             |                    |
| file_type  | TEXT        | NOT NULL                                                                                  | e.g. 'pdf', 'docx' |
| content    | TEXT        |                                                                                           | Raw text content   |
| status     | TEXT        | NOT NULL, default 'pending', CHECK (pending,uploading,uploaded,analyzing,analyzed,failed) |                    |
| version    | INTEGER     | NOT NULL, default 1, >= 1                                                                 |                    |
| created_at | TIMESTAMPTZ | NOT NULL, default now()                                                                   |                    |
| updated_at | TIMESTAMPTZ | NOT NULL, default now()                                                                   |                    |

### 3. `resume_analyses`

AI-generated resume analysis results.

| Column      | Type        | Constraints                      | Description                            |
| ----------- | ----------- | -------------------------------- | -------------------------------------- |
| id          | UUID        | PK, default gen_random_uuid()    |                                        |
| resume_id   | UUID        | NOT NULL, FK → resumes(id)       |                                        |
| skills      | JSONB       | NOT NULL, default '[]'           | Array of {name, level, relevance}      |
| experience  | INTEGER     | NOT NULL, default 0, >= 0        |                                        |
| suggestions | JSONB       | NOT NULL, default '[]'           | Array of {category, message, priority} |
| summary     | TEXT        | NOT NULL, default ''             |                                        |
| score       | INTEGER     | NOT NULL, default 0, CHECK 0-100 | ATS score                              |
| model       | TEXT        | NOT NULL, default ''             | AI model used                          |
| created_at  | TIMESTAMPTZ | NOT NULL, default now()          |                                        |

### 4. `resume_snapshots`

Versioned snapshots of parsed resume data.

| Column     | Type                 | Constraints                   | Description      |
| ---------- | -------------------- | ----------------------------- | ---------------- |
| id         | UUID                 | PK, default gen_random_uuid() |                  |
| resume_id  | UUID                 | NOT NULL, FK → resumes(id)    |                  |
| version    | INTEGER              | NOT NULL, >= 1                |                  |
| snapshot   | JSONB                | NOT NULL                      | ParsedResumeData |
| created_at | TIMESTAMPTZ          | NOT NULL, default now()       |                  |
| UNIQUE     | (resume_id, version) |                               |                  |

### 5. `resume_analysis_versions`

Versioned analysis results tied to snapshot versions.

| Column           | Type        | Constraints                      | Description |
| ---------------- | ----------- | -------------------------------- | ----------- |
| id               | UUID        | PK, default gen_random_uuid()    |             |
| resume_id        | UUID        | NOT NULL, FK → resumes(id)       |             |
| snapshot_version | INTEGER     | NOT NULL, >= 1                   |             |
| skills           | JSONB       | NOT NULL, default '[]'           |             |
| experience       | INTEGER     | NOT NULL, default 0, >= 0        |             |
| suggestions      | JSONB       | NOT NULL, default '[]'           |             |
| summary          | TEXT        | NOT NULL, default ''             |             |
| score            | INTEGER     | NOT NULL, default 0, CHECK 0-100 |             |
| model            | TEXT        | NOT NULL, default ''             |             |
| created_at       | TIMESTAMPTZ | NOT NULL, default now()          |             |

### 6. `resume_parsed_data`

Cached parsed resume data for fast access.

| Column     | Type        | Constraints             | Description |
| ---------- | ----------- | ----------------------- | ----------- |
| resume_id  | UUID        | PK, FK → resumes(id)    |             |
| data       | JSONB       | NOT NULL                |             |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() |             |

### 7. `resume_profile_snapshots`

Cached profile snapshots for resume analysis (one per user).

| Column     | Type        | Constraints             | Description |
| ---------- | ----------- | ----------------------- | ----------- |
| user_id    | UUID        | PK, FK → auth.users(id) |             |
| data       | JSONB       | NOT NULL                |             |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() |             |

### 8. `jobs`

Aggregated job listings from external providers.

| Column              | Type        | Constraints                                                                    | Description     |
| ------------------- | ----------- | ------------------------------------------------------------------------------ | --------------- |
| id                  | TEXT        | PK                                                                             | External job ID |
| title               | TEXT        | NOT NULL                                                                       |                 |
| company             | TEXT        | NOT NULL                                                                       |                 |
| description         | TEXT        | NOT NULL, default ''                                                           |                 |
| location            | TEXT        |                                                                                |                 |
| type                | TEXT        | NOT NULL, default 'full-time', CHECK (full-time,part-time,contract,internship) |                 |
| status              | TEXT        | NOT NULL, default 'active', CHECK (active,paused,closed,draft)                 |                 |
| salary_min          | INTEGER     |                                                                                |                 |
| salary_max          | INTEGER     | CHECK (min <= max if both set)                                                 |                 |
| currency            | TEXT        | NOT NULL, default 'USD'                                                        |                 |
| skills              | TEXT[]      | default '{}'                                                                   |                 |
| experience_required | INTEGER     | NOT NULL, default 0, >= 0                                                      |                 |
| application_url     | TEXT        |                                                                                |                 |
| posted_at           | TIMESTAMPTZ | NOT NULL, default now()                                                        |                 |
| expires_at          | TIMESTAMPTZ |                                                                                |                 |
| created_at          | TIMESTAMPTZ | NOT NULL, default now()                                                        |                 |
| updated_at          | TIMESTAMPTZ | NOT NULL, default now()                                                        |                 |

### 9. `job_matches`

Calculated match scores between users and jobs.

| Column     | Type              | Constraints                      | Description                |
| ---------- | ----------------- | -------------------------------- | -------------------------- |
| id         | UUID              | PK, default gen_random_uuid()    |                            |
| job_id     | TEXT              | NOT NULL, FK → jobs(id)          |                            |
| user_id    | UUID              | NOT NULL, FK → auth.users(id)    |                            |
| score      | INTEGER           | NOT NULL, default 0, CHECK 0-100 |                            |
| reasons    | TEXT[]            | default '{}'                     |                            |
| strengths  | TEXT[]            | default '{}'                     |                            |
| gaps       | TEXT[]            | default '{}'                     |                            |
| created_at | TIMESTAMPTZ       | NOT NULL, default now()          |                            |
| UNIQUE     | (job_id, user_id) |                                  | One match per user per job |

### 10. `applications`

Job applications tracking (supports both discovery and tracker domains).

| Column       | Type        | Constraints                                                                                                   | Description              |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| id           | UUID        | PK, default gen_random_uuid()                                                                                 |                          |
| user_id      | UUID        | NOT NULL, FK → auth.users(id)                                                                                 |                          |
| job_id       | TEXT        | NOT NULL                                                                                                      |                          |
| resume_id    | UUID        | FK → resumes(id), ON DELETE SET NULL                                                                          |                          |
| company      | TEXT        | NOT NULL, default ''                                                                                          |                          |
| role         | TEXT        | NOT NULL, default ''                                                                                          |                          |
| stage        | TEXT        | NOT NULL, default 'saved', CHECK (saved,applied,screening,interview,technical,final,offer,rejected,withdrawn) | Application domain stage |
| status       | TEXT        | NOT NULL, default 'draft', CHECK (draft,submitted,reviewing,interview,offered,accepted,rejected,withdrawn)    | Discovery domain status  |
| cover_letter | TEXT        |                                                                                                               |                          |
| notes        | TEXT        |                                                                                                               |                          |
| applied_date | TIMESTAMPTZ |                                                                                                               |                          |
| submitted_at | TIMESTAMPTZ |                                                                                                               |                          |
| created_at   | TIMESTAMPTZ | NOT NULL, default now()                                                                                       |                          |
| updated_at   | TIMESTAMPTZ | NOT NULL, default now()                                                                                       |                          |

### 11. `referrals`

Job referral requests.

| Column         | Type        | Constraints                                                                   | Description |
| -------------- | ----------- | ----------------------------------------------------------------------------- | ----------- |
| id             | UUID        | PK, default gen_random_uuid()                                                 |             |
| user_id        | UUID        | NOT NULL, FK → auth.users(id)                                                 |             |
| job_id         | TEXT        | NOT NULL                                                                      |             |
| referrer_name  | TEXT        | NOT NULL                                                                      |             |
| referrer_email | TEXT        | NOT NULL, CHECK valid email                                                   |             |
| message        | TEXT        | NOT NULL, default ''                                                          |             |
| status         | TEXT        | NOT NULL, default 'pending', CHECK (pending,sent,accepted,rejected,cancelled) |             |
| created_at     | TIMESTAMPTZ | NOT NULL, default now()                                                       |             |
| updated_at     | TIMESTAMPTZ | NOT NULL, default now()                                                       |             |

### 12. `feeds`

Generated job feeds per user.

| Column       | Type        | Constraints                   | Description       |
| ------------ | ----------- | ----------------------------- | ----------------- |
| id           | UUID        | PK, default gen_random_uuid() |                   |
| user_id      | UUID        | NOT NULL, FK → auth.users(id) |                   |
| items        | JSONB       | NOT NULL, default '[]'        | Array of FeedItem |
| cursor       | TEXT        |                               | Pagination cursor |
| has_more     | BOOLEAN     | NOT NULL, default false       |                   |
| generated_at | TIMESTAMPTZ | NOT NULL, default now()       |                   |
| created_at   | TIMESTAMPTZ | NOT NULL, default now()       |                   |

### 13. `feed_generations`

Log of feed generation runs.

| Column       | Type        | Constraints                                                              | Description |
| ------------ | ----------- | ------------------------------------------------------------------------ | ----------- |
| id           | UUID        | PK, default gen_random_uuid()                                            |             |
| user_id      | UUID        | NOT NULL, FK → auth.users(id)                                            |             |
| job_count    | INTEGER     | NOT NULL, default 0, >= 0                                                |             |
| source       | TEXT        | NOT NULL, default 'auto', CHECK (manual,auto,refresh)                    |             |
| status       | TEXT        | NOT NULL, default 'pending', CHECK (pending,processing,completed,failed) |             |
| error        | TEXT        |                                                                          |             |
| created_at   | TIMESTAMPTZ | NOT NULL, default now()                                                  |             |
| completed_at | TIMESTAMPTZ |                                                                          |             |

### 14. `swipe_sessions`

Swipe-based job discovery sessions.

| Column       | Type        | Constraints                                                 | Description          |
| ------------ | ----------- | ----------------------------------------------------------- | -------------------- |
| id           | UUID        | PK, default gen_random_uuid()                               |                      |
| user_id      | UUID        | NOT NULL, FK → auth.users(id)                               |                      |
| status       | TEXT        | NOT NULL, default 'active', CHECK (active,paused,completed) |                      |
| actions      | JSONB       | NOT NULL, default '[]'                                      | Array of SwipeAction |
| started_at   | TIMESTAMPTZ | NOT NULL, default now()                                     |                      |
| completed_at | TIMESTAMPTZ |                                                             |                      |
| created_at   | TIMESTAMPTZ | NOT NULL, default now()                                     |                      |

### 15. `job_sync_runs`

Provider sync execution tracking.

| Column        | Type        | Constraints             | Description  |
| ------------- | ----------- | ----------------------- | ------------ |
| run_id        | TEXT        | PK                      |              |
| provider      | TEXT        | NOT NULL                |              |
| jobs_fetched  | INTEGER     | NOT NULL, default 0     |              |
| jobs_accepted | INTEGER     | NOT NULL, default 0     |              |
| jobs_rejected | INTEGER     | NOT NULL, default 0     |              |
| duration      | INTEGER     | NOT NULL, default 0     | Milliseconds |
| started_at    | TIMESTAMPTZ | NOT NULL, default now() |              |
| completed_at  | TIMESTAMPTZ |                         |              |

### 16. `normalized_job_sources`

Provider health and quality metrics.

| Column            | Type        | Constraints                        | Description |
| ----------------- | ----------- | ---------------------------------- | ----------- |
| source            | TEXT        | PK                                 |             |
| success_rate      | INTEGER     | NOT NULL, default 100, CHECK 0-100 |             |
| last_sync         | TIMESTAMPTZ |                                    |             |
| avg_quality_score | INTEGER     | NOT NULL, default 0                |             |
| error_rate        | INTEGER     | NOT NULL, default 0, CHECK 0-100   |             |
| total_runs        | INTEGER     | NOT NULL, default 0                |             |

### 17. `ai_models`

Registered AI models with capabilities and pricing.

| Column            | Type    | Constraints            | Description                            |
| ----------------- | ------- | ---------------------- | -------------------------------------- |
| id                | TEXT    | PK                     | Short identifier                       |
| name              | TEXT    | NOT NULL               |                                        |
| provider          | TEXT    | NOT NULL               |                                        |
| model_id          | TEXT    | NOT NULL               | Full model ID                          |
| capabilities      | TEXT[]  | default '{}'           | chat, stream, embed, vision, reasoning |
| pricing           | JSONB   | NOT NULL               | {inputPer1K, outputPer1K, currency}    |
| context_window    | INTEGER | NOT NULL, > 0          |                                        |
| max_output_tokens | INTEGER | NOT NULL, > 0          |                                        |
| is_enabled        | BOOLEAN | NOT NULL, default true |                                        |

### 18. `ai_prompts`

Prompt templates with versioning.

| Column     | Type        | Constraints                                                       | Description             |
| ---------- | ----------- | ----------------------------------------------------------------- | ----------------------- |
| id         | TEXT        | PK                                                                |                         |
| name       | TEXT        | NOT NULL                                                          |                         |
| category   | TEXT        | NOT NULL, CHECK (analysis,generation,matching,extraction,summary) |                         |
| template   | TEXT        | NOT NULL                                                          |                         |
| version    | INTEGER     | NOT NULL, default 1, >= 1                                         |                         |
| variables  | TEXT[]      | default '{}'                                                      | Template variable names |
| model      | TEXT        | NOT NULL                                                          |                         |
| is_active  | BOOLEAN     | NOT NULL, default true                                            |                         |
| created_at | TIMESTAMPTZ | NOT NULL, default now()                                           |                         |
| updated_at | TIMESTAMPTZ | NOT NULL, default now()                                           |                         |

### 19. `ai_usage_records`

Per-request AI usage telemetry.

| Column            | Type          | Constraints                   | Description |
| ----------------- | ------------- | ----------------------------- | ----------- |
| id                | UUID          | PK, default gen_random_uuid() |             |
| user_id           | UUID          | NOT NULL, FK → auth.users(id) |             |
| model             | TEXT          | NOT NULL                      |             |
| provider          | TEXT          | NOT NULL                      |             |
| prompt_tokens     | INTEGER       | NOT NULL, default 0           |             |
| completion_tokens | INTEGER       | NOT NULL, default 0           |             |
| total_tokens      | INTEGER       | NOT NULL, default 0           |             |
| cost              | NUMERIC(10,6) | NOT NULL, default 0           |             |
| latency_ms        | INTEGER       | NOT NULL, default 0           |             |
| endpoint          | TEXT          | NOT NULL                      |             |
| success           | BOOLEAN       | NOT NULL, default true        |             |
| error_code        | TEXT          |                               |             |
| timestamp         | TIMESTAMPTZ   | NOT NULL, default now()       |             |

### 20. `user_feedback`

User swipe/action feedback on jobs (recommendation learning).

| Column     | Type                      | Constraints                            | Description |
| ---------- | ------------------------- | -------------------------------------- | ----------- |
| id         | UUID                      | PK, default gen_random_uuid()          |             |
| user_id    | UUID                      | NOT NULL, FK → auth.users(id)          |             |
| job_id     | TEXT                      | NOT NULL                               |             |
| action     | TEXT                      | NOT NULL, CHECK (like,pass,save,apply) |             |
| created_at | TIMESTAMPTZ               | NOT NULL, default now()                |             |
| UNIQUE     | (user_id, job_id, action) |                                        |             |

### 21. `feedback`

General user feedback and bug reports.

| Column     | Type        | Constraints                   | Description |
| ---------- | ----------- | ----------------------------- | ----------- |
| id         | UUID        | PK, default gen_random_uuid() |             |
| user_id    | UUID        | NOT NULL, FK → auth.users(id) |             |
| type       | TEXT        | NOT NULL, default 'general'   |             |
| message    | TEXT        | NOT NULL                      |             |
| metadata   | JSONB       | default '{}'                  |             |
| created_at | TIMESTAMPTZ | NOT NULL, default now()       |             |

---

## Row Level Security

All tables with `user_id` enforce `auth.uid() = user_id` policies. Exceptions:

| Table                    | Policy                                           | Rationale                             |
| ------------------------ | ------------------------------------------------ | ------------------------------------- |
| `jobs`                   | PUBLIC SELECT, service_role INSERT/UPDATE/DELETE | Aggregated from external providers    |
| `job_sync_runs`          | service_role only                                | Internal monitoring                   |
| `normalized_job_sources` | service_role only                                | Internal monitoring                   |
| `ai_models`              | PUBLIC SELECT, service_role INSERT/UPDATE        | Model registry is read-only for users |
| `ai_prompts`             | PUBLIC SELECT, service_role INSERT/UPDATE        | Prompt templates are not sensitive    |
| `ai_usage_records`       | User SELECT/INSERT own                           | Users see their own usage             |
| `feedback`               | User INSERT own, SELECT own                      | General feedback                      |

Tables with ownership via join (no direct user_id):

- `resume_analyses`: access via `EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_analyses.resume_id AND resumes.user_id = auth.uid())`
- `resume_snapshots`: same pattern
- `resume_analysis_versions`: same pattern
- `resume_parsed_data`: same pattern

---

## Storage Bucket: `resumes`

- **Public**: false
- **Path convention**: `{user_id}/{resume_id}.txt`
- **Policies**:
  - Authenticated users can INSERT/SELECT/UPDATE/DELETE files in their own folder (first path segment matches `auth.uid()`)

---

## Constraints Summary

| Constraint Type          | Count |
| ------------------------ | ----- |
| PRIMARY KEY              | 21    |
| FOREIGN KEY (auth.users) | 13    |
| FOREIGN KEY (resumes)    | 5     |
| FOREIGN KEY (jobs)       | 2     |
| UNIQUE                   | 5     |
| CHECK (value range)      | 12    |
| CHECK (status enum)      | 9     |

---

## Indexes

| Table                    | Indexes                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| profiles                 | user_id, skills (GIN), target_roles (GIN), preferred_locations (GIN) |
| resumes                  | user_id, status, user_id+status                                      |
| resume_analyses          | resume_id, score                                                     |
| resume_snapshots         | resume_id, resume_id+version                                         |
| resume_analysis_versions | resume_id                                                            |
| jobs                     | company, type, status, posted_at (DESC), skills (GIN)                |
| job_matches              | user_id, job_id, score (DESC), user_id+score                         |
| job_sync_runs            | provider, started_at                                                 |
| applications             | user_id, job_id, status, stage, user_id+status                       |
| referrals                | user_id, job_id, status                                              |
| feeds                    | user_id                                                              |
| feed_generations         | user_id, status                                                      |
| swipe_sessions           | user_id, status                                                      |
| ai_usage_records         | user_id, model, timestamp (DESC), user_id+timestamp                  |
| ai_prompts               | category, is_active (partial)                                        |
| user_feedback            | user_id, job_id                                                      |
| feedback                 | user_id, type                                                        |

---

## Migration Order

1. `migrations/001_core_schema.sql` — Full schema including all tables, RLS, storage, and indexes
2. `seed.sql` — Development seed data (replace UUIDs with real auth user IDs first)

---

## Entity-Domain Mapping

| Domain      | Entity File                                                  | DB Table                                     |
| ----------- | ------------------------------------------------------------ | -------------------------------------------- |
| Auth        | `auth/entities/user.ts`                                      | auth.users (managed by Supabase Auth)        |
| Profile     | `profile/entities/user-profile.ts`                           | profiles                                     |
| Resume      | `resume/entities/resume.ts`                                  | resumes                                      |
| Resume      | `resume/entities/resume-analysis.ts`                         | resume_analyses                              |
| Resume      | `resume/entities/resume-snapshot.ts`                         | resume_snapshots                             |
| Resume      | `resume/entities/resume-analysis-version.ts`                 | resume_analysis_versions                     |
| Resume      | `resume/contracts/resume-parser.contract` → ParsedResumeData | resume_parsed_data, resume_profile_snapshots |
| Discovery   | `discovery/entities/job.ts`                                  | jobs                                         |
| Discovery   | `discovery/entities/job-match.ts`                            | job_matches                                  |
| Discovery   | `discovery/entities/feed.ts`                                 | feeds                                        |
| Discovery   | `discovery/entities/feed-generation.ts`                      | feed_generations                             |
| Discovery   | `discovery/entities/swipe-session.ts`                        | swipe_sessions                               |
| Discovery   | `discovery/entities/application.ts`                          | applications                                 |
| Discovery   | `discovery/entities/referral.ts`                             | referrals                                    |
| Discovery   | `discovery/entities/user-feedback.ts`                        | user_feedback                                |
| Discovery   | `discovery/entities/normalized-job-source.ts`                | normalized_job_sources                       |
| Discovery   | `discovery/entities/job-sync-run.ts`                         | job_sync_runs                                |
| Application | `application/entities/application.ts`                        | applications (merged)                        |
| AI          | `ai/entities/ai-model.ts`                                    | ai_models                                    |
| AI          | `ai/entities/ai-prompt.ts`                                   | ai_prompts                                   |
| AI          | `ai/entities/ai-usage.ts`                                    | ai_usage_records                             |
| General     | (none)                                                       | feedback                                     |
