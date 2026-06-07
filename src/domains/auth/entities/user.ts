import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: UserData): Result<User> {
    if (!data.id) return failure(new ValidationError('User id is required'));
    if (!data.email || !data.email.includes('@'))
      return failure(new ValidationError('Valid email is required'));
    return success(
      new User(data.id, data.email, data.name, data.avatarUrl, data.createdAt, data.updatedAt),
    );
  }

  updateProfile(name: string, avatarUrl: string | null): Result<User> {
    if (!name || name.trim().length === 0)
      return failure(new ValidationError('Name cannot be empty'));
    return success(
      new User(this.id, this.email, name.trim(), avatarUrl, this.createdAt, new Date()),
    );
  }
}
