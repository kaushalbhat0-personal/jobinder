import { create } from 'zustand';
import type { Feed } from '../entities/feed';
import type { SwipeSession } from '../entities/swipe-session';

interface DiscoveryState {
  feed: Feed | null;
  session: SwipeSession | null;
  isLoading: boolean;
  error: string | null;
}

interface DiscoveryActions {
  setFeed: (feed: Feed | null) => void;
  setSession: (session: SwipeSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type DiscoveryStore = DiscoveryState & DiscoveryActions;

export const useDiscoveryStore = create<DiscoveryStore>((set) => ({
  feed: null,
  session: null,
  isLoading: false,
  error: null,
  setFeed: (feed) => set({ feed }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ feed: null, session: null, isLoading: false, error: null }),
}));
