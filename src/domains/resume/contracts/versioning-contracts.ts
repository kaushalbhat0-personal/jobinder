export interface ResumeVersioningContract {
  getVersionHistory(
    resumeId: string,
  ): Promise<Array<{ version: number; createdAt: Date; status: string }>>;
  createNewVersion(resumeId: string, reason: string): Promise<string>;
  rollbackToVersion(resumeId: string, version: number): Promise<void>;
  getLatestVersion(resumeId: string): Promise<number>;
}
