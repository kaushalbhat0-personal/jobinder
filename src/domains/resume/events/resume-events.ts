import { eventBus } from '@/shared/events/event-bus';

export const ResumeEventTypes = {
  ResumeUploaded: 'resume:uploaded',
  ResumeParsed: 'resume:parsed',
  ResumeAnalyzed: 'resume:analyzed',
  ResumeVersionCreated: 'resume:version-created',
  ResumeAnalysisStarted: 'resume:analysis-started',
  ResumeAnalysisCompleted: 'resume:analysis-completed',
  ResumeAnalysisFailed: 'resume:analysis-failed',
} as const;

export interface ResumeUploadedPayload {
  userId: string;
  resumeId: string;
  version: number;
}
export interface ResumeParsedPayload {
  userId: string;
  resumeId: string;
  version: number;
}
export interface ResumeAnalyzedPayload {
  userId: string;
  resumeId: string;
  score: number;
}
export interface ResumeVersionCreatedPayload {
  resumeId: string;
  version: number;
  reason: string;
}
export interface ResumeAnalysisStartedPayload {
  userId: string;
  resumeId: string;
  snapshotVersion: number;
}
export interface ResumeAnalysisCompletedPayload {
  userId: string;
  resumeId: string;
  snapshotVersion: number;
  score: number;
}
export interface ResumeAnalysisFailedPayload {
  userId: string;
  resumeId: string;
  snapshotVersion: number;
  error: string;
}

export type ResumeEventPayloads = {
  [ResumeEventTypes.ResumeUploaded]: ResumeUploadedPayload;
  [ResumeEventTypes.ResumeParsed]: ResumeParsedPayload;
  [ResumeEventTypes.ResumeAnalyzed]: ResumeAnalyzedPayload;
  [ResumeEventTypes.ResumeVersionCreated]: ResumeVersionCreatedPayload;
  [ResumeEventTypes.ResumeAnalysisStarted]: ResumeAnalysisStartedPayload;
  [ResumeEventTypes.ResumeAnalysisCompleted]: ResumeAnalysisCompletedPayload;
  [ResumeEventTypes.ResumeAnalysisFailed]: ResumeAnalysisFailedPayload;
};

export function emitResumeEvent<K extends keyof ResumeEventPayloads & string>(
  type: K,
  payload: ResumeEventPayloads[K],
): void {
  eventBus.emit(type as never, payload as never);
}
