import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { AuthRepository } from '../repositories/auth-repository';
import { ValidationError } from '@/shared/core/errors';

export class ResetPasswordUseCase {
  constructor(private readonly authRepo: AuthRepository) {}

  async execute(email: string): Promise<Result<void>> {
    if (!email || !email.includes('@'))
      return failure(new ValidationError('Valid email is required'));
    try {
      await this.authRepo.resetPasswordForEmail(email);
      return success(undefined);
    } catch (error) {
      return failure(
        error instanceof Error ? error : new ValidationError('Failed to send reset email'),
      );
    }
  }
}
