import { create } from 'zustand';
import type { UserProfile } from '../entities/user-profile';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface ProfileActions {
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ProfileStore = ProfileState & ProfileActions;

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ profile: null, isLoading: false, error: null }),
}));
