import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { AuthRepository } from '../repositories/auth-repository';
import type { User } from '../entities/user';
import { ValidationError } from '@/shared/core/errors';

export class SignUpUseCase {
  constructor(private readonly authRepo: AuthRepository) {}

  async execute(email: string, password: string, name: string): Promise<Result<User>> {
    if (!name || name.trim().length === 0) return failure(new ValidationError('Name is required'));
    if (!email || !email.includes('@'))
      return failure(new ValidationError('Valid email is required'));
    if (!password || password.length < 6)
      return failure(new ValidationError('Password must be at least 6 characters'));
    try {
      const user = await this.authRepo.signUp(email, password, name.trim());
      return success(user);
    } catch (error) {
      return failure(error instanceof Error ? error : new ValidationError('Sign-up failed'));
    }
  }
}
