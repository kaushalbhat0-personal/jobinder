export interface ResumeQueryContract {
  getResume(
    userId: string,
  ): Promise<{ id: string; fileName: string; status: string; version: number } | null>;
  getAnalysis(
    resumeId: string,
  ): Promise<{ skills: string[]; experience: number; score: number; suggestions: string[] } | null>;
  getLatestVersion(userId: string): Promise<number | null>;
}
