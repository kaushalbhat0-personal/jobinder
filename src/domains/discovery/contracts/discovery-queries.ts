export interface DiscoveryQueryContract {
  getFeed(userId: string): Promise<Array<{ jobId: string; score: number; reason: string }>>;
  getJobDetails(
    jobId: string,
  ): Promise<{ title: string; company: string; description: string } | null>;
  getReferralStatus(referralId: string): Promise<string | null>;
  getApplicationStatus(applicationId: string): Promise<string | null>;
}
