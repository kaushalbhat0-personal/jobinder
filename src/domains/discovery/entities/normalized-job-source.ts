export interface NormalizedJobSourceData {
  source: string;
  successRate: number;
  lastSync: Date | null;
  avgQualityScore: number;
  errorRate: number;
  totalRuns: number;
}

export class NormalizedJobSource {
  private constructor(
    public readonly source: string,
    public successRate: number,
    public lastSync: Date | null,
    public avgQualityScore: number,
    public errorRate: number,
    public totalRuns: number,
  ) {}

  static create(source: string): NormalizedJobSource {
    return new NormalizedJobSource(source, 100, null, 0, 0, 0);
  }

  recordSync(success: boolean, avgQuality: number): void {
    this.totalRuns++;
    this.lastSync = new Date();
    this.avgQualityScore = avgQuality;

    const totalSuccess = (this.successRate * (this.totalRuns - 1)) / 100;
    const newSuccessCount = success ? totalSuccess + 1 : totalSuccess;
    this.successRate = Math.round((newSuccessCount / this.totalRuns) * 100);

    const totalErrors = (this.errorRate * (this.totalRuns - 1)) / 100;
    const newErrorCount = success ? totalErrors : totalErrors + 1;
    this.errorRate = Math.round((newErrorCount / this.totalRuns) * 100);
  }

  snapshot(): NormalizedJobSourceData {
    return {
      source: this.source,
      successRate: this.successRate,
      lastSync: this.lastSync,
      avgQualityScore: this.avgQualityScore,
      errorRate: this.errorRate,
      totalRuns: this.totalRuns,
    };
  }
}
