import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useAuthStore } from '@/domains/auth/stores/auth-store';
import { User } from '@/domains/auth/entities/user';

const mockSaveJob = vi.fn();
const mockPassJob = vi.fn();
const mockApplyJob = vi.fn();
const mockRefetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/feed',
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => {
    const store = useAuthStore.getState();
    return {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      error: store.error,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    };
  },
}));

vi.mock('@/domains/discovery/hooks/use-feed', () => ({
  useFeed: () => ({
    feedJobs: [],
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    saveJob: mockSaveJob,
    passJob: mockPassJob,
    applyToJob: mockApplyJob,
    isSaving: false,
    isPassing: false,
    isApplying: false,
  }),
}));

import FeedPage from '../feed/page';

describe('FeedPage', () => {
  beforeEach(() => {
    const testUser = User.create({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).getOrThrow();

    useAuthStore.setState({
      user: testUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
    mockRefetch.mockClear();
  });

  it('renders page header', () => {
    render(<FeedPage />);
    expect(screen.getByText('Job Feed')).toBeInTheDocument();
  });

  it('shows empty state when no jobs available', () => {
    render(<FeedPage />);
    expect(screen.getByText('No jobs available yet')).toBeInTheDocument();
  });

  it('shows refresh button in empty state', () => {
    render(<FeedPage />);
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });
});
