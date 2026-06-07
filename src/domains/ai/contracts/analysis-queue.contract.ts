import type { Result } from '@/shared/core/result';

export type AnalysisJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface AnalysisJob {
  id: string;
  resumeId: string;
  userId: string;
  snapshotVersion: number;
  status: AnalysisJobStatus;
  createdAt: Date;
  completedAt: Date | null;
  error: string | null;
}

export interface AnalysisQueueContract {
  enqueue(resumeId: string, userId: string, snapshotVersion: number): Promise<Result<string>>;
  dequeue(): Promise<Result<AnalysisJob | null>>;
  getStatus(jobId: string): Promise<Result<AnalysisJobStatus>>;
  markCompleted(jobId: string): Promise<Result<void>>;
  markFailed(jobId: string, error: string): Promise<Result<void>>;
  getPendingCount(): Promise<Result<number>>;
}
