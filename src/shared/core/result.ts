export type Result<T, E = Error> = Success<T, E> | Failure<T, E>;

export class Success<T, E = Error> {
  readonly _tag = 'success' as const;

  constructor(public readonly value: T) {}

  isSuccess(): this is Success<T, E> {
    return true;
  }

  isFailure(): this is Failure<T, E> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Success(fn(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getOrElse(defaultValue: T): T {
    return this.value;
  }

  getOrThrow(): T {
    return this.value;
  }
}

export class Failure<T, E = Error> {
  readonly _tag = 'failure' as const;

  constructor(public readonly error: E) {}

  isSuccess(): this is Success<T, E> {
    return false;
  }

  isFailure(): this is Failure<T, E> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    return new Failure(fn(this.error)) as unknown as Result<T, F>;
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  getOrThrow(): never {
    throw this.error;
  }
}

export function success<T, E = never>(value: T): Success<T, E> {
  return new Success(value);
}

export function failure<T = never, E = Error>(error: E): Failure<T, E> {
  return new Failure(error);
}
