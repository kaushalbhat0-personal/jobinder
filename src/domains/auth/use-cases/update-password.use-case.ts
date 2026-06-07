import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { AuthRepository } from '../repositories/auth-repository';
import { ValidationError } from '@/shared/core/errors';

export class UpdatePasswordUseCase {
  constructor(private readonly authRepo: AuthRepository) {}

  async execute(newPassword: string): Promise<Result<void>> {
    if (!newPassword || newPassword.length < 6)
      return failure(new ValidationError('Password must be at least 6 characters'));
    try {
      await this.authRepo.updatePassword(newPassword);
      return success(undefined);
    } catch (error) {
      return failure(
        error instanceof Error ? error : new ValidationError('Failed to update password'),
      );
    }
  }
}
