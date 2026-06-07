import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  InfrastructureError,
  NotFoundError,
  UnauthorizedError,
  isAppError,
  handleError,
} from '@/shared/core/errors';

describe('Error Infrastructure', () => {
  describe('AppError', () => {
    it('creates an error with default values', () => {
      const error = new AppError('test error');
      expect(error.message).toBe('test error');
      expect(error.code).toBe('UNKNOWN');
      expect(error.status).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('accepts custom code and status', () => {
      const error = new AppError('custom', 'CUSTOM_CODE', 418);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.status).toBe(418);
    });

    it('accepts meta', () => {
      const error = new AppError('with meta', 'ERR', 500, { key: 'value' });
      expect(error.meta).toEqual({ key: 'value' });
    });
  });

  describe('ValidationError', () => {
    it('sets correct defaults', () => {
      const error = new ValidationError('invalid');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
    });
  });

  describe('InfrastructureError', () => {
    it('sets correct defaults', () => {
      const error = new InfrastructureError('db down');
      expect(error.code).toBe('INFRASTRUCTURE_ERROR');
      expect(error.status).toBe(500);
    });
  });

  describe('NotFoundError', () => {
    it('sets correct defaults', () => {
      const error = new NotFoundError('not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });
  });

  describe('UnauthorizedError', () => {
    it('sets correct defaults', () => {
      const error = new UnauthorizedError();
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('isAppError', () => {
    it('returns true for AppError instances', () => {
      expect(isAppError(new AppError('x'))).toBe(true);
    });

    it('returns false for regular errors', () => {
      expect(isAppError(new Error('x'))).toBe(false);
    });
  });

  describe('handleError', () => {
    it('passes through AppError', () => {
      const original = new ValidationError('bad');
      const result = handleError(original);
      expect(result).toBe(original);
    });

    it('wraps regular Error', () => {
      const result = handleError(new Error('regular'));
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('regular');
      expect(result.code).toBe('UNKNOWN');
    });

    it('wraps unknown values', () => {
      const result = handleError('string error');
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });
});
