import { describe, it, expect } from 'vitest';
import { User } from '../entities/user';

describe('User entity', () => {
  const validData = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('creates a user with valid data', () => {
    const result = User.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.id).toBe('user-1');
      expect(result.value.email).toBe('test@example.com');
    }
  });

  it('fails when id is empty', () => {
    const result = User.create({ ...validData, id: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when email is invalid', () => {
    const result = User.create({ ...validData, email: 'not-an-email' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when email is empty', () => {
    const result = User.create({ ...validData, email: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('updates profile', () => {
    const createResult = User.create(validData);
    expect(createResult.isSuccess()).toBe(true);
    if (createResult.isSuccess()) {
      const updated = createResult.value.updateProfile('New Name', 'https://avatar.url');
      expect(updated.isSuccess()).toBe(true);
      if (updated.isSuccess()) {
        expect(updated.value.name).toBe('New Name');
        expect(updated.value.avatarUrl).toBe('https://avatar.url');
      }
    }
  });

  it('fails profile update with empty name', () => {
    const createResult = User.create(validData);
    expect(createResult.isSuccess()).toBe(true);
    if (createResult.isSuccess()) {
      const updated = createResult.value.updateProfile('', null);
      expect(updated.isFailure()).toBe(true);
    }
  });
});
