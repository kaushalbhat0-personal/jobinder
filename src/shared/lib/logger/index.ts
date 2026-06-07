type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    meta,
  };
}

function stringify(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry('info', message, meta);
    console.log(stringify(entry));
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry('warn', message, meta);
    console.warn(stringify(entry));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry('error', message, meta);
    console.error(stringify(entry));
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      const entry = createLogEntry('debug', message, meta);
      console.debug(stringify(entry));
    }
  },
};
