import type { UserProfile } from '../entities/user-profile';
import type { Result } from '@/shared/core/result';

export interface ProfileRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<Result<UserProfile>>;
  delete(id: string): Promise<void>;
}
