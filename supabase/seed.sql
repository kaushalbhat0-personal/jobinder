-- ============================================================================
-- Seed Data for Development
-- JOBinder
-- ============================================================================
-- Prerequisites:
--   1. Run migrations/001_core_schema.sql first
--   2. Create auth users in Supabase Auth dashboard or via API
--   3. Replace the UUIDs below with actual auth.users IDs
--   4. Run this with service_role key: psql -U service_role -d your_db -f seed.sql
-- ============================================================================

-- ============================================================================
-- Helper: Get or create test user IDs
-- ============================================================================
-- Run these after creating auth users:
-- SELECT id, email FROM auth.users;

-- Replace these with actual auth user IDs from your Supabase project
-- For local dev, create users via Supabase Auth dashboard first
-- ============================================================================

-- ============================================================================
-- Test UUIDs (replace with real auth.users IDs)
-- ============================================================================
-- To generate real test users, run:
--   INSERT INTO auth.users (id, email, encrypted_password) VALUES
--     (gen_random_uuid(), 'alice@example.com', crypt('password123', gen_salt('bf'))),
--     (gen_random_uuid(), 'bob@example.com', crypt('password123', gen_salt('bf')));
-- Then copy the generated IDs below.

-- ============================================================================
-- 1. Profiles
-- ============================================================================

INSERT INTO profiles (id, user_id, name, headline, bio, location, skills, experience, career_stage, target_roles, preferred_locations, expected_salary_min, expected_salary_max) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001', -- Replace: Alice's auth user ID
    'Alice Johnson',
    'Full Stack Developer | React & Node.js Enthusiast',
    'Passionate software engineer with 5 years of experience building web applications.',
    'San Francisco, CA',
    ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    5,
    'experienced',
    ARRAY['Senior Full Stack Developer', 'Tech Lead'],
    ARRAY['San Francisco, CA', 'Remote', 'New York, NY'],
    120000,
    180000
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002', -- Replace: Bob's auth user ID
    'Bob Smith',
    'Frontend Developer | UI/UX Focused',
    'Recent computer science graduate looking for frontend opportunities.',
    'Austin, TX',
    ARRAY['JavaScript', 'React', 'CSS', 'HTML', 'Git'],
    0,
    'fresher',
    ARRAY['Junior Frontend Developer', 'Frontend Engineer'],
    ARRAY['Austin, TX', 'Remote'],
    60000,
    90000
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003', -- Replace: Charlie's auth user ID
    'Charlie Brown',
    'Data Scientist | ML Engineer',
    'MS in Data Science. Experienced in building ML pipelines and analytics dashboards.',
    'Seattle, WA',
    ARRAY['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'Docker'],
    3,
    'experienced',
    ARRAY['Data Scientist', 'ML Engineer'],
    ARRAY['Seattle, WA', 'Remote', 'San Francisco, CA'],
    130000,
    200000
  );

-- ============================================================================
-- 2. Resumes
-- ============================================================================

INSERT INTO resumes (id, user_id, file_name, file_size, file_type, content, status, version) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'alice_johnson_resume_2024.pdf',
    245760,
    'pdf',
    'Experienced full stack developer with expertise in React, Node.js, and cloud infrastructure.',
    'analyzed',
    3
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'bob_smith_resume.pdf',
    182400,
    'pdf',
    'Recent graduate with strong frontend development skills and internship experience.',
    'uploaded',
    1
  );

-- ============================================================================
-- 3. Resume Snapshots
-- ============================================================================

INSERT INTO resume_snapshots (id, resume_id, version, snapshot) VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    1,
    '{
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1-555-0101",
      "experience": 5,
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
      "education": [
        {"degree": "B.S. Computer Science", "institution": "UC Berkeley", "year": 2019}
      ],
      "rawText": "Experienced full stack developer..."
    }'::jsonb
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    2,
    '{
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1-555-0101",
      "experience": 5,
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      "education": [
        {"degree": "B.S. Computer Science", "institution": "UC Berkeley", "year": 2019},
        {"degree": "M.S. Software Engineering", "institution": "Stanford", "year": 2021}
      ],
      "rawText": "Senior full stack developer with cloud expertise..."
    }'::jsonb
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    1,
    '{
      "name": "Bob Smith",
      "email": "bob@example.com",
      "phone": "+1-555-0102",
      "experience": 0,
      "skills": ["JavaScript", "React", "CSS", "HTML", "Git"],
      "education": [
        {"degree": "B.S. Computer Science", "institution": "UT Austin", "year": 2024}
      ],
      "rawText": "Recent graduate..."
    }'::jsonb
  );

-- ============================================================================
-- 4. Resume Analyses
-- ============================================================================

INSERT INTO resume_analyses (id, resume_id, skills, experience, suggestions, summary, score, model) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '[
      {"name": "React", "level": "expert", "relevance": 95},
      {"name": "Node.js", "level": "expert", "relevance": 90},
      {"name": "TypeScript", "level": "advanced", "relevance": 85},
      {"name": "PostgreSQL", "level": "advanced", "relevance": 75},
      {"name": "AWS", "level": "intermediate", "relevance": 70}
    ]'::jsonb,
    5,
    '[
      {"category": "format", "message": "Add quantifiable achievements", "priority": "high"},
      {"category": "skills", "message": "Consider adding Docker/Kubernetes", "priority": "medium"},
      {"category": "presentation", "message": "Shorten summary to 2 sentences", "priority": "low"}
    ]'::jsonb,
    'Strong full stack profile with leadership potential. Score reflects solid technical foundation and progressive career growth.',
    82,
    'deepseek/deepseek-chat-v3-0324:free'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    '[
      {"name": "React", "level": "intermediate", "relevance": 80},
      {"name": "JavaScript", "level": "advanced", "relevance": 85},
      {"name": "CSS", "level": "advanced", "relevance": 75},
      {"name": "Git", "level": "intermediate", "relevance": 60}
    ]'::jsonb,
    0,
    '[
      {"category": "experience", "message": "Add personal projects or open source contributions", "priority": "high"},
      {"category": "education", "message": "Include relevant coursework", "priority": "medium"},
      {"category": "skills", "message": "Consider learning TypeScript and a backend framework", "priority": "medium"}
    ]'::jsonb,
    'Solid entry-level frontend profile with good fundamentals. Needs project portfolio to stand out.',
    65,
    'deepseek/deepseek-chat-v3-0324:free'
  );

-- ============================================================================
-- 5. Resume Analysis Versions
-- ============================================================================

INSERT INTO resume_analysis_versions (id, resume_id, snapshot_version, skills, experience, suggestions, summary, score, model) VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    1,
    '[
      {"name": "React", "level": "advanced", "relevance": 90},
      {"name": "Node.js", "level": "advanced", "relevance": 85},
      {"name": "JavaScript", "level": "expert", "relevance": 92}
    ]'::jsonb,
    5,
    '[
      {"category": "skills", "message": "Add TypeScript", "priority": "high"}
    ]'::jsonb,
    'Good profile with room for growth.',
    75,
    'deepseek/deepseek-chat-v3-0324:free'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    2,
    '[
      {"name": "React", "level": "expert", "relevance": 95},
      {"name": "Node.js", "level": "expert", "relevance": 90},
      {"name": "TypeScript", "level": "advanced", "relevance": 85},
      {"name": "PostgreSQL", "level": "advanced", "relevance": 75},
      {"name": "AWS", "level": "intermediate", "relevance": 70}
    ]'::jsonb,
    5,
    '[
      {"category": "format", "message": "Add quantifiable achievements", "priority": "high"}
    ]'::jsonb,
    'Strong full stack profile with leadership potential.',
    82,
    'deepseek/deepseek-chat-v3-0324:free'
  );

-- ============================================================================
-- 6. Resume Parsed Data
-- ============================================================================

INSERT INTO resume_parsed_data (resume_id, data) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    '{
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1-555-0101",
      "experience": 5,
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      "education": [
        {"degree": "B.S. Computer Science", "institution": "UC Berkeley", "year": 2019},
        {"degree": "M.S. Software Engineering", "institution": "Stanford", "year": 2021}
      ],
      "rawText": "Senior full stack developer..."
    }'::jsonb
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    '{
      "name": "Bob Smith",
      "email": "bob@example.com",
      "phone": "+1-555-0102",
      "experience": 0,
      "skills": ["JavaScript", "React", "CSS", "HTML", "Git"],
      "education": [
        {"degree": "B.S. Computer Science", "institution": "UT Austin", "year": 2024}
      ],
      "rawText": "Recent graduate..."
    }'::jsonb
  );

-- ============================================================================
-- 7. Resume Profile Snapshots
-- ============================================================================

INSERT INTO resume_profile_snapshots (user_id, data) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '{
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1-555-0101",
      "experience": 5,
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      "education": [
        {"degree": "B.S. Computer Science", "institution": "UC Berkeley", "year": 2019},
        {"degree": "M.S. Software Engineering", "institution": "Stanford", "year": 2021}
      ],
      "rawText": "Senior full stack developer..."
    }'::jsonb
  );

-- ============================================================================
-- 8. Jobs (from external providers)
-- ============================================================================

INSERT INTO jobs (id, title, company, description, location, type, salary_min, salary_max, currency, skills, experience_required, application_url, posted_at) VALUES
  (
    'job-001',
    'Senior Full Stack Developer',
    'TechCorp Inc.',
    'We are looking for a senior full stack developer to join our platform team. You will be building scalable microservices and rich frontend experiences.',
    'San Francisco, CA',
    'full-time',
    140000,
    200000,
    'USD',
    ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
    5,
    'https://techcorp.example.com/apply/senior-fullstack',
    now() - interval '2 days'
  ),
  (
    'job-002',
    'Frontend Developer',
    'StartupXYZ',
    'Join our fast-growing startup as a frontend developer. Work with React, TypeScript, and modern CSS.',
    'Remote',
    'full-time',
    80000,
    120000,
    'USD',
    ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'GraphQL'],
    2,
    'https://startupxyz.example.com/careers/frontend',
    now() - interval '5 days'
  ),
  (
    'job-003',
    'Data Scientist',
    'DataDriven Co.',
    'Help us extract insights from massive datasets. Experience with ML pipelines and statistical modeling required.',
    'Seattle, WA',
    'full-time',
    130000,
    180000,
    'USD',
    ARRAY['Python', 'TensorFlow', 'SQL', 'Spark', 'Statistics'],
    3,
    'https://datadriven.example.com/jobs/data-scientist',
    now() - interval '1 day'
  ),
  (
    'job-004',
    'Junior Frontend Developer',
    'WebAgency LLC',
    'Great opportunity for recent graduates. Build beautiful interfaces using React and modern tooling.',
    'Austin, TX',
    'full-time',
    55000,
    75000,
    'USD',
    ARRAY['React', 'JavaScript', 'CSS', 'HTML'],
    0,
    'https://webagency.example.com/careers/junior-frontend',
    now() - interval '7 days'
  ),
  (
    'job-005',
    'ML Engineer',
    'AI Innovations',
    'Design and deploy machine learning models at scale. Strong proficiency in Python and deep learning frameworks required.',
    'San Francisco, CA',
    'full-time',
    150000,
    220000,
    'USD',
    ARRAY['Python', 'PyTorch', 'TensorFlow', 'Kubernetes', 'MLOps'],
    4,
    'https://aiinnovations.example.com/careers/ml-engineer',
    now() - interval '3 days'
  ),
  (
    'job-006',
    'Backend Developer (Node.js)',
    'CloudScale',
    'Build and maintain high-throughput API services. Experience with event-driven architectures preferred.',
    'New York, NY',
    'full-time',
    120000,
    160000,
    'USD',
    ARRAY['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Kafka'],
    3,
    'https://cloudscale.example.com/jobs/backend',
    now() - interval '10 days'
  ),
  (
    'job-007',
    'Full Stack Developer',
    'SaaSPro',
    'Join our product team to build next-gen SaaS platform. Full ownership of features from frontend to database.',
    'Remote',
    'contract',
    100,
    150,
    'USD',
    ARRAY['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
    4,
    'https://saaspro.example.com/apply/fullstack-contract',
    now() - interval '14 days'
  ),
  (
    'job-008',
    'Engineering Intern',
    'BigTech Corp',
    'Summer internship for computer science students. Work on real projects with mentorship.',
    'Mountain View, CA',
    'internship',
    6000,
    8000,
    'USD',
    ARRAY['Python', 'Java', 'Algorithms', 'Data Structures'],
    0,
    'https://bigtech.example.com/internships',
    now() - interval '20 days'
  );

-- ============================================================================
-- 9. Job Matches
-- ============================================================================

INSERT INTO job_matches (id, job_id, user_id, score, reasons, strengths, gaps) VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'job-001',
    '00000000-0000-0000-0000-000000000001',
    92,
    ARRAY['Strong React and Node.js match', '5 years experience aligns', 'AWS experience matches'],
    ARRAY['Full stack capability', 'Cloud infrastructure', 'Leadership potential'],
    ARRAY['No Docker listed', 'Team management experience unclear']
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'job-006',
    '00000000-0000-0000-0000-000000000001',
    85,
    ARRAY['Node.js expertise matches', 'TypeScript experience', 'PostgreSQL proficiency'],
    ARRAY['Backend architecture', 'Database design', 'Type safety'],
    ARRAY['No Redis/Kafka experience mentioned']
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'job-004',
    '00000000-0000-0000-0000-000000000002',
    88,
    ARRAY['React skills match entry level', 'Location matches Austin, TX', 'Good cultural fit potential'],
    ARRAY['Frontend fundamentals', 'Portfolio projects'],
    ARRAY['No professional experience', 'Limited TypeScript exposure']
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'job-003',
    '00000000-0000-0000-0000-000000000003',
    95,
    ARRAY['Python expertise', 'SQL proficiency', 'Seattle location match'],
    ARRAY['Data science background', 'ML pipeline experience', 'Strong math fundamentals'],
    ARRAY['No Spark mentioned', 'TensorFlow experience limited']
  );

-- ============================================================================
-- 10. Applications
-- ============================================================================

INSERT INTO applications (id, user_id, job_id, company, role, stage, status, notes) VALUES
  (
    'g0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'job-001',
    'TechCorp Inc.',
    'Senior Full Stack Developer',
    'applied',
    'submitted',
    'Applied through company website. Follow up in 1 week.'
  ),
  (
    'g0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'job-006',
    'CloudScale',
    'Backend Developer (Node.js)',
    'saved',
    'draft',
    'Need to tailor resume for this role.'
  ),
  (
    'g0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'job-004',
    'WebAgency LLC',
    'Junior Frontend Developer',
    'interview',
    'reviewing',
    'Phone screen scheduled for next week.'
  );

-- ============================================================================
-- 11. Referrals
-- ============================================================================

INSERT INTO referrals (id, user_id, job_id, referrer_name, referrer_email, message, status) VALUES
  (
    'h0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'job-001',
    'Jane Mentor',
    'jane.mentor@example.com',
    'Hi Jane, I think I would be a great fit for the Senior Full Stack role at TechCorp. Would you be willing to refer me?',
    'pending'
  ),
  (
    'h0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'job-005',
    'Dr. Lee',
    'dr.lee@example.com',
    'Dr. Lee, I would appreciate a referral for the ML Engineer position at AI Innovations.',
    'sent'
  );

-- ============================================================================
-- 12. Feeds
-- ============================================================================

INSERT INTO feeds (id, user_id, items, has_more, generated_at) VALUES
  (
    'i0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '[
      {"id": "job-001", "type": "job", "score": 92, "payload": {}},
      {"id": "job-006", "type": "job", "score": 85, "payload": {}},
      {"id": "job-002", "type": "job", "score": 70, "payload": {}}
    ]'::jsonb,
    true,
    now()
  ),
  (
    'i0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '[
      {"id": "job-004", "type": "job", "score": 88, "payload": {}},
      {"id": "job-002", "type": "job", "score": 75, "payload": {}}
    ]'::jsonb,
    false,
    now()
  );

-- ============================================================================
-- 13. Feed Generations
-- ============================================================================

INSERT INTO feed_generations (id, user_id, job_count, source, status, completed_at) VALUES
  (
    'j0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    3,
    'auto',
    'completed',
    now()
  ),
  (
    'j0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    2,
    'auto',
    'completed',
    now()
  );

-- ============================================================================
-- 14. Swipe Sessions
-- ============================================================================

INSERT INTO swipe_sessions (id, user_id, status, actions, started_at, completed_at) VALUES
  (
    'k0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'completed',
    '[
      {"jobId": "job-001", "direction": "right", "score": 92, "timestamp": "2026-06-05T10:00:00Z"},
      {"jobId": "job-006", "direction": "right", "score": 85, "timestamp": "2026-06-05T10:01:00Z"},
      {"jobId": "job-002", "direction": "left", "score": 70, "timestamp": "2026-06-05T10:02:00Z"},
      {"jobId": "job-007", "direction": "save", "score": 60, "timestamp": "2026-06-05T10:03:00Z"}
    ]'::jsonb,
    now() - interval '2 days',
    now() - interval '2 days' + interval '5 minutes'
  );

-- ============================================================================
-- 15. User Feedback (swipe actions on jobs)
-- ============================================================================

INSERT INTO user_feedback (id, user_id, job_id, action) VALUES
  (
    'l0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'job-001',
    'like'
  ),
  (
    'l0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'job-004',
    'like'
  ),
  (
    'l0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'job-003',
    'save'
  );

-- ============================================================================
-- 16. AI Models
-- ============================================================================

INSERT INTO ai_models (id, name, provider, model_id, capabilities, pricing, context_window, max_output_tokens, is_enabled) VALUES
  (
    'deepseek-chat-v3',
    'DeepSeek Chat V3',
    'deepseek',
    'deepseek/deepseek-chat-v3-0324:free',
    ARRAY['chat', 'reasoning'],
    '{"inputPer1K": 0, "outputPer1K": 0, "currency": "USD"}'::jsonb,
    65536,
    8192,
    true
  ),
  (
    'gemini-2.5-flash',
    'Gemini 2.5 Flash',
    'google',
    'google/gemini-2.5-flash',
    ARRAY['chat', 'stream', 'vision'],
    '{"inputPer1K": 0.00015, "outputPer1K": 0.0006, "currency": "USD"}'::jsonb,
    1048576,
    8192,
    true
  ),
  (
    'qwen3',
    'Qwen 3',
    'qwen',
    'qwen/qwen3',
    ARRAY['chat'],
    '{"inputPer1K": 0, "outputPer1K": 0, "currency": "USD"}'::jsonb,
    32768,
    4096,
    false
  );

-- ============================================================================
-- 17. AI Prompts
-- ============================================================================

INSERT INTO ai_prompts (id, name, category, template, version, variables, model, is_active) VALUES
  (
    'resume-analysis-v1',
    'Resume Analysis',
    'analysis',
    'Analyze the following resume and provide a detailed assessment including ATS score, missing skills, strengths, weaknesses, suggested roles, and recommendations.

Resume Data:
{{resumeData}}

Return the analysis as a JSON object with the following structure:
{
  "atsScore": number,
  "missingSkills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "suggestedRoles": string[],
  "recommendations": string[],
  "summary": string
}',
    1,
    ARRAY['resumeData'],
    'deepseek/deepseek-chat-v3-0324:free',
    true
  ),
  (
    'job-matching-v1',
    'Job Matching',
    'matching',
    'Given a user profile and a job description, calculate a match score and provide reasoning.

User Profile:
{{profileData}}

Job Description:
{{jobData}}

Return the match analysis as a JSON object with the following structure:
{
  "score": number,
  "reasons": string[],
  "strengths": string[],
  "gaps": string[],
  "overallFit": string
}',
    1,
    ARRAY['profileData', 'jobData'],
    'deepseek/deepseek-chat-v3-0324:free',
    true
  );

-- ============================================================================
-- 18. Job Sync Runs
-- ============================================================================

INSERT INTO job_sync_runs (run_id, provider, jobs_fetched, jobs_accepted, jobs_rejected, duration, started_at, completed_at) VALUES
  ('sync-remotive-001', 'remotive', 50, 35, 15, 3200, now() - interval '1 day', now() - interval '1 day' + interval '3 seconds'),
  ('sync-remoteok-001', 'remoteok', 40, 28, 12, 2800, now() - interval '1 day' + interval '5 seconds', now() - interval '1 day' + interval '8 seconds');

-- ============================================================================
-- 19. Normalized Job Sources (provider health)
-- ============================================================================

INSERT INTO normalized_job_sources (source, success_rate, last_sync, avg_quality_score, error_rate, total_runs) VALUES
  ('remotive', 92, now() - interval '1 day', 78, 8, 150),
  ('remoteok', 88, now() - interval '1 day', 72, 12, 120),
  ('wellfound', 95, now() - interval '2 days', 85, 5, 80);

-- ============================================================================
-- 20. AI Usage Records
-- ============================================================================

INSERT INTO ai_usage_records (id, user_id, model, provider, prompt_tokens, completion_tokens, total_tokens, cost, latency_ms, endpoint, success) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'deepseek/deepseek-chat-v3-0324:free',
    'deepseek',
    450,
    320,
    770,
    0,
    3400,
    '/chat/completions',
    true
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'deepseek/deepseek-chat-v3-0324:free',
    'deepseek',
    520,
    410,
    930,
    0,
    4100,
    '/chat/completions',
    true
  );

-- ============================================================================
-- 21. General Feedback
-- ============================================================================

INSERT INTO feedback (id, user_id, type, message, metadata) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'feature_request',
    'It would be great to have dark mode support.',
    '{"page": "dashboard", "browser": "Chrome 120"}'::jsonb
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002',
    'bug',
    'The resume upload page shows an error when uploading PDFs larger than 5MB.',
    '{"page": "upload", "fileSize": 6291456, "browser": "Firefox 121"}'::jsonb
  );
