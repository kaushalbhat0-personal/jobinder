import { describe, it, expect } from 'vitest';
import type { ProfileQueryContract } from '../contracts/profile-queries';

describe('Profile contracts', () => {
  it('ProfileQueryContract defines required methods', () => {
    const contract: ProfileQueryContract = {
      getProfile: async () => null,
      getPreferences: async () => ({}),
    };
    expect(contract.getProfile).toBeDefined();
    expect(contract.getPreferences).toBeDefined();
  });
});
