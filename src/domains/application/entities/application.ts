export const ApplicationStages = [
  'saved',
  'applied',
  'screening',
  'interview',
  'technical',
  'final',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationStage = (typeof ApplicationStages)[number];

const STAGE_ORDER: Record<ApplicationStage, number> = {
  saved: 0,
  applied: 1,
  screening: 2,
  interview: 3,
  technical: 4,
  final: 5,
  offer: 6,
  rejected: -1,
  withdrawn: -2,
};

export interface ApplicationData {
  id: string;
  userId: string;
  jobId: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  appliedDate: Date;
  lastUpdated: Date;
}

export class Application {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly jobId: string,
    public readonly company: string,
    public readonly role: string,
    public readonly stage: ApplicationStage,
    public readonly appliedDate: Date,
    public readonly lastUpdated: Date,
  ) {}

  static create(data: ApplicationData): Application {
    return new Application(
      data.id,
      data.userId,
      data.jobId,
      data.company,
      data.role,
      data.stage,
      data.appliedDate,
      data.lastUpdated,
    );
  }

  isTerminal(): boolean {
    return this.stage === 'rejected' || this.stage === 'withdrawn' || this.stage === 'offer';
  }

  isActive(): boolean {
    return !this.isTerminal();
  }

  isInterview(): boolean {
    return this.stage === 'interview' || this.stage === 'technical' || this.stage === 'final';
  }

  transitionTo(newStage: ApplicationStage): Application {
    return new Application(
      this.id,
      this.userId,
      this.jobId,
      this.company,
      this.role,
      newStage,
      this.appliedDate,
      new Date(),
    );
  }

  canTransitionTo(newStage: ApplicationStage): boolean {
    if (this.stage === newStage) return false;
    if (this.stage === 'rejected' || this.stage === 'withdrawn') return false;
    const currentOrder = STAGE_ORDER[this.stage];
    const newOrder = STAGE_ORDER[newStage];
    if (currentOrder < 0 || newOrder < 0) return true;
    return newOrder >= currentOrder;
  }
}
