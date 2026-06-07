import type { Result } from '@/shared/core/result';
import { success } from '@/shared/core/result';
import type { AuthRepository } from '../repositories/auth-repository';

export class SignOutUseCase {
  constructor(private readonly authRepo: AuthRepository) {}

  async execute(): Promise<Result<void>> {
    await this.authRepo.signOut();
    return success(undefined);
  }
}
