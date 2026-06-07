let runCounter = 0;

export interface JobSyncRunData {
  runId: string;
  provider: string;
  jobsFetched: number;
  jobsAccepted: number;
  jobsRejected: number;
  duration: number;
  startedAt: Date;
  completedAt: Date | null;
}

export class JobSyncRun {
  private constructor(
    public readonly runId: string,
    public readonly provider: string,
    public jobsFetched: number,
    public jobsAccepted: number,
    public jobsRejected: number,
    public duration: number,
    public readonly startedAt: Date,
    public completedAt: Date | null,
  ) {}

  static start(provider: string): JobSyncRun {
    runCounter++;
    return new JobSyncRun(
      `sync-${provider}-${Date.now()}-${runCounter}`,
      provider,
      0,
      0,
      0,
      0,
      new Date(),
      null,
    );
  }

  complete(fetched: number, accepted: number, rejected: number): void {
    this.jobsFetched = fetched;
    this.jobsAccepted = accepted;
    this.jobsRejected = rejected;
    this.completedAt = new Date();
    this.duration = this.completedAt.getTime() - this.startedAt.getTime();
  }

  snapshot(): JobSyncRunData {
    return {
      runId: this.runId,
      provider: this.provider,
      jobsFetched: this.jobsFetched,
      jobsAccepted: this.jobsAccepted,
      jobsRejected: this.jobsRejected,
      duration: this.duration,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}
