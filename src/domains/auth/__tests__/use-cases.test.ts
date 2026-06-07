import { describe, it, expect, vi } from 'vitest';
import { SignInUseCase } from '../use-cases/sign-in.use-case';
import { SignUpUseCase } from '../use-cases/sign-up.use-case';
import { SignOutUseCase } from '../use-cases/sign-out.use-case';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { UpdatePasswordUseCase } from '../use-cases/update-password.use-case';
import type { AuthRepository } from '../repositories/auth-repository';
import { User } from '../entities/user';

function createMockRepo(): AuthRepository {
  return {
    signInWithOAuth: vi.fn(),
    signInWithOtp: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updatePassword: vi.fn(),
    verifyOtp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => () => {}),
  };
}

function makeUser(overrides?: Partial<{ id: string; email: string; name: string }>): User {
  return User.create({
    id: overrides?.id ?? 'u1',
    email: overrides?.email ?? 'a@b.com',
    name: overrides?.name ?? 'Test',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).getOrThrow();
}

describe('SignInUseCase', () => {
  it('executes OAuth sign-in', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.signInWithOAuth).mockResolvedValue(undefined);
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithOAuth('google');
    expect(result.isSuccess()).toBe(true);
    expect(repo.signInWithOAuth).toHaveBeenCalledWith('google');
  });

  it('handles OAuth sign-in failure gracefully', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.signInWithOAuth).mockRejectedValue(new Error('OAuth error'));
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithOAuth('google');
    expect(result.isFailure()).toBe(true);
  });

  it('executes password sign-in', async () => {
    const repo = createMockRepo();
    const user = makeUser();
    vi.mocked(repo.signInWithPassword).mockResolvedValue(user);
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithPassword('a@b.com', 'password123');
    expect(result.isSuccess()).toBe(true);
    expect(repo.signInWithPassword).toHaveBeenCalledWith('a@b.com', 'password123');
  });

  it('validates email for password sign-in', async () => {
    const repo = createMockRepo();
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithPassword('invalid', 'password123');
    expect(result.isFailure()).toBe(true);
    expect(repo.signInWithPassword).not.toHaveBeenCalled();
  });

  it('validates password length for password sign-in', async () => {
    const repo = createMockRepo();
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithPassword('a@b.com', '12345');
    expect(result.isFailure()).toBe(true);
    expect(repo.signInWithPassword).not.toHaveBeenCalled();
  });

  it('handles password sign-in failure gracefully', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.signInWithPassword).mockRejectedValue(new Error('Invalid credentials'));
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithPassword('a@b.com', 'password123');
    expect(result.isFailure()).toBe(true);
  });
});

describe('SignUpUseCase', () => {
  it('signs up with valid data', async () => {
    const repo = createMockRepo();
    const user = makeUser({ name: 'John Doe' });
    vi.mocked(repo.signUp).mockResolvedValue(user);
    const uc = new SignUpUseCase(repo);
    const result = await uc.execute('a@b.com', 'password123', 'John Doe');
    expect(result.isSuccess()).toBe(true);
    expect(repo.signUp).toHaveBeenCalledWith('a@b.com', 'password123', 'John Doe');
  });

  it('validates name is required', async () => {
    const repo = createMockRepo();
    const uc = new SignUpUseCase(repo);
    const result = await uc.execute('a@b.com', 'password123', '');
    expect(result.isFailure()).toBe(true);
    expect(repo.signUp).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const repo = createMockRepo();
    const uc = new SignUpUseCase(repo);
    const result = await uc.execute('invalid', 'password123', 'John');
    expect(result.isFailure()).toBe(true);
  });

  it('validates password length', async () => {
    const repo = createMockRepo();
    const uc = new SignUpUseCase(repo);
    const result = await uc.execute('a@b.com', '12345', 'John');
    expect(result.isFailure()).toBe(true);
  });

  it('handles sign-up failure gracefully', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.signUp).mockRejectedValue(new Error('Email already registered'));
    const uc = new SignUpUseCase(repo);
    const result = await uc.execute('a@b.com', 'password123', 'John');
    expect(result.isFailure()).toBe(true);
  });

  it('trims name whitespace', async () => {
    const repo = createMockRepo();
    const user = makeUser({ name: 'John' });
    vi.mocked(repo.signUp).mockResolvedValue(user);
    const uc = new SignUpUseCase(repo);
    const result = await uc.execute('a@b.com', 'password123', '  John  ');
    expect(result.isSuccess()).toBe(true);
    expect(repo.signUp).toHaveBeenCalledWith('a@b.com', 'password123', 'John');
  });
});

describe('ResetPasswordUseCase', () => {
  it('sends reset email for valid email', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.resetPasswordForEmail).mockResolvedValue(undefined);
    const uc = new ResetPasswordUseCase(repo);
    const result = await uc.execute('a@b.com');
    expect(result.isSuccess()).toBe(true);
    expect(repo.resetPasswordForEmail).toHaveBeenCalledWith('a@b.com');
  });

  it('validates email format', async () => {
    const repo = createMockRepo();
    const uc = new ResetPasswordUseCase(repo);
    const result = await uc.execute('invalid');
    expect(result.isFailure()).toBe(true);
    expect(repo.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('handles failure gracefully', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.resetPasswordForEmail).mockRejectedValue(new Error('Network error'));
    const uc = new ResetPasswordUseCase(repo);
    const result = await uc.execute('a@b.com');
    expect(result.isFailure()).toBe(true);
  });
});

describe('UpdatePasswordUseCase', () => {
  it('updates password with valid input', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.updatePassword).mockResolvedValue(undefined);
    const uc = new UpdatePasswordUseCase(repo);
    const result = await uc.execute('newpassword123');
    expect(result.isSuccess()).toBe(true);
    expect(repo.updatePassword).toHaveBeenCalledWith('newpassword123');
  });

  it('validates password length', async () => {
    const repo = createMockRepo();
    const uc = new UpdatePasswordUseCase(repo);
    const result = await uc.execute('12345');
    expect(result.isFailure()).toBe(true);
    expect(repo.updatePassword).not.toHaveBeenCalled();
  });

  it('handles failure gracefully', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.updatePassword).mockRejectedValue(new Error('Update failed'));
    const uc = new UpdatePasswordUseCase(repo);
    const result = await uc.execute('newpassword123');
    expect(result.isFailure()).toBe(true);
  });
});

describe('SignOutUseCase', () => {
  it('signs out successfully', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.signOut).mockResolvedValue(undefined);
    const uc = new SignOutUseCase(repo);
    const result = await uc.execute();
    expect(result.isSuccess()).toBe(true);
  });
});
