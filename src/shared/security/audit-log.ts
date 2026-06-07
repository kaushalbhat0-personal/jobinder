export type AuditAction =
  | 'user.signup'
  | 'user.login'
  | 'user.logout'
  | 'profile.update'
  | 'resume.upload'
  | 'resume.delete'
  | 'resume.analyze'
  | 'job.apply'
  | 'job.like'
  | 'referral.request'
  | 'ai.usage'
  | 'admin.action';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  targetId: string | null;
  severity: AuditSeverity;
  metadata: Record<string, unknown>;
  ip: string | null;
  timestamp: Date;
}

const log: AuditEntry[] = [];

export function recordAuditEvent(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const record: AuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };
  log.push(record);

  if (entry.severity === 'error' || entry.severity === 'critical') {
    console.error(`[Audit:${entry.severity}] ${entry.action} by ${entry.actorId}`, entry.metadata);
  }

  return record;
}

export function getAuditLog(): readonly AuditEntry[] {
  return log;
}

export function queryAuditLog(
  filters: Partial<{ actorId: string; action: AuditAction; severity: AuditSeverity }>,
): AuditEntry[] {
  return log.filter((entry) => {
    if (filters.actorId && entry.actorId !== filters.actorId) return false;
    if (filters.action && entry.action !== filters.action) return false;
    if (filters.severity && entry.severity !== filters.severity) return false;
    return true;
  });
}

export function clearAuditLog(): void {
  log.length = 0;
}
