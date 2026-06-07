import { describe, it, expect } from 'vitest';
import type { AuthQueryContract } from '../contracts/auth-queries';

describe('Auth contracts', () => {
  it('AuthQueryContract defines required methods', () => {
    const contract: AuthQueryContract = {
      getCurrentUserId: async () => null,
      isAuthenticated: async () => false,
      getUserEmail: async () => null,
      getUser: async () => null,
    };
    expect(contract.getCurrentUserId).toBeDefined();
    expect(contract.isAuthenticated).toBeDefined();
    expect(contract.getUserEmail).toBeDefined();
    expect(contract.getUser).toBeDefined();
  });
});
