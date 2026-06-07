import { describe, it, expect } from 'vitest';
import { success, failure, Success, Failure } from '@/shared/core/result';

describe('Result Pattern', () => {
  describe('success', () => {
    it('creates a Success with the given value', () => {
      const result = success(42);
      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.value).toBe(42);
    });

    it('getOrElse returns the value', () => {
      const result = success('hello');
      expect(result.getOrElse('default')).toBe('hello');
    });

    it('getOrThrow returns the value', () => {
      const result = success('hello');
      expect(result.getOrThrow()).toBe('hello');
    });

    it('map transforms the value', () => {
      const result = success(5).map((x) => x * 2);
      expect(result.isSuccess()).toBe(true);
      expect((result as Success<number>).value).toBe(10);
    });

    it('mapError does nothing', () => {
      const result = success(5).mapError((e: Error) => new Error(`new: ${e.message}`));
      expect(result.isSuccess()).toBe(true);
      expect((result as Success<number>).value).toBe(5);
    });
  });

  describe('failure', () => {
    it('creates a Failure with the given error', () => {
      const error = new Error('something went wrong');
      const result = failure(error);
      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe(error);
    });

    it('getOrElse returns the default value', () => {
      const result = failure<string>(new Error('fail'));
      expect(result.getOrElse('default')).toBe('default');
    });

    it('getOrThrow throws the error', () => {
      const result = failure(new Error('fail'));
      expect(() => result.getOrThrow()).toThrow('fail');
    });

    it('map does nothing', () => {
      const result = failure(new Error('fail')).map((x: unknown) => x);
      expect(result.isFailure()).toBe(true);
    });

    it('mapError transforms the error', () => {
      const result = failure(new Error('original')).mapError(
        (e) => new Error(`mapped: ${e.message}`),
      );
      expect(result.isFailure()).toBe(true);
      expect((result as Failure<unknown, Error>).error.message).toBe('mapped: original');
    });
  });

  describe('type narrowing', () => {
    it('discriminates success/failure with _tag', () => {
      const results = [success(1), failure(new Error('x'))];
      const values = results
        .filter((r) => r._tag === 'success')
        .map((r) => (r as Success<number>).value);
      expect(values).toEqual([1]);
    });
  });
});
