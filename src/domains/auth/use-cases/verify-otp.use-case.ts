import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { AuthRepository } from '../repositories/auth-repository';
import type { User } from '../entities/user';
import { ValidationError } from '@/shared/core/errors';

export class VerifyOtpUseCase {
  constructor(private readonly authRepo: AuthRepository) {}

  async execute(email: string, token: string): Promise<Result<User>> {
    if (!email || !email.includes('@'))
      return failure(new ValidationError('Valid email is required'));
    if (!token || token.length === 0)
      return failure(new ValidationError('Verification token is required'));
    try {
      const user = await this.authRepo.verifyOtp(email, token);
      return success(user);
    } catch (error) {
      return failure(
        error instanceof Error ? error : new ValidationError('OTP verification failed'),
      );
    }
  }
}
