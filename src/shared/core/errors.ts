export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'UNKNOWN',
    public readonly status: number = 500,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public override readonly meta?: Record<string, unknown>,
  ) {
    super(message, 'VALIDATION_ERROR', 400, meta);
    this.name = 'ValidationError';
  }
}

export class InfrastructureError extends AppError {
  constructor(
    message: string,
    code: string = 'INFRASTRUCTURE_ERROR',
    status: number = 500,
    meta?: Record<string, unknown>,
  ) {
    super(message, code, status, meta);
    this.name = 'InfrastructureError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', 404, meta);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', meta?: Record<string, unknown>) {
    super(message, 'UNAUTHORIZED', 401, meta);
    this.name = 'UnauthorizedError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(error.message, 'UNKNOWN', 500);
  return new AppError('An unexpected error occurred', 'UNKNOWN', 500);
}
