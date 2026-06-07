import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { AuthRepository } from '../repositories/auth-repository';
import { ValidationError } from '@/shared/core/errors';

export class SignInUseCase {
  constructor(private readonly authRepo: AuthRepository) {}

  async executeWithOAuth(provider: 'google'): Promise<Result<void>> {
    try {
      await this.authRepo.signInWithOAuth(provider);
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new ValidationError('OAuth sign-in failed'));
    }
  }

  async executeWithOtp(email: string): Promise<Result<void>> {
    if (!email || !email.includes('@'))
      return failure(new ValidationError('Valid email is required'));
    try {
      await this.authRepo.signInWithOtp(email);
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new ValidationError('OTP send failed'));
    }
  }
}
