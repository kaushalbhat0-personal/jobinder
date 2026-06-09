-- Add unique constraint on (user_id, job_id) for applications
-- Business rule: 1 user + 1 job = 1 application
ALTER TABLE applications
ADD CONSTRAINT uq_applications_user_job
UNIQUE (user_id, job_id);
