import { describe, it, expect, vi } from 'vitest';
import { SignInUseCase } from '../use-cases/sign-in.use-case';
import { VerifyOtpUseCase } from '../use-cases/verify-otp.use-case';
import { SignOutUseCase } from '../use-cases/sign-out.use-case';
import type { AuthRepository } from '../repositories/auth-repository';
import { User } from '../entities/user';

function createMockRepo(): AuthRepository {
  return {
    signInWithOAuth: vi.fn(),
    signInWithOtp: vi.fn(),
    verifyOtp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => () => {}),
  };
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

  it('executes OTP sign-in', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.signInWithOtp).mockResolvedValue(undefined);
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithOtp('a@b.com');
    expect(result.isSuccess()).toBe(true);
    expect(repo.signInWithOtp).toHaveBeenCalledWith('a@b.com');
  });

  it('validates email for OTP', async () => {
    const repo = createMockRepo();
    const uc = new SignInUseCase(repo);
    const result = await uc.executeWithOtp('invalid');
    expect(result.isFailure()).toBe(true);
    expect(repo.signInWithOtp).not.toHaveBeenCalled();
  });
});

describe('VerifyOtpUseCase', () => {
  it('verifies OTP and returns user', async () => {
    const repo = createMockRepo();
    const user = User.create({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).getOrThrow();
    vi.mocked(repo.verifyOtp).mockResolvedValue(user);
    const uc = new VerifyOtpUseCase(repo);
    const result = await uc.execute('a@b.com', '123456');
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.id).toBe('u1');
    }
  });

  it('fails with invalid email', async () => {
    const repo = createMockRepo();
    const uc = new VerifyOtpUseCase(repo);
    const result = await uc.execute('invalid', '123456');
    expect(result.isFailure()).toBe(true);
  });

  it('fails with empty token', async () => {
    const repo = createMockRepo();
    const uc = new VerifyOtpUseCase(repo);
    const result = await uc.execute('a@b.com', '');
    expect(result.isFailure()).toBe(true);
  });

  it('handles verification failure gracefully', async () => {
    const repo = createMockRepo();
    vi.mocked(repo.verifyOtp).mockRejectedValue(new Error('Invalid token'));
    const uc = new VerifyOtpUseCase(repo);
    const result = await uc.execute('a@b.com', '000000');
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
