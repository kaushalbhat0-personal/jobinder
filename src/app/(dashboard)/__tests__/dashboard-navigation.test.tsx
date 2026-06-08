import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useAuthStore } from '@/domains/auth/stores/auth-store';
import { useProfileStore } from '@/domains/profile/stores/profile-store';
import { User } from '@/domains/auth/entities/user';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => {
    const store = useAuthStore.getState();
    return {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      error: store.error,
      signInWithGoogle: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      signOut: vi.fn(),
    };
  },
}));

import DashboardPage from '../dashboard/page';

describe('Dashboard Navigation', () => {
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
    useProfileStore.setState({
      profile: null,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
    mockPush.mockClear();
  });

  it('renders welcome message with user name', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
  });

  it('renders Resume dashboard card with CTA', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Upload Resume')).toBeInTheDocument();
  });

  it('renders AI Analysis dashboard card', () => {
    render(<DashboardPage />);
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('Analyze Resume')).toBeInTheDocument();
  });

  it('renders Job Feed dashboard card', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Job Feed')).toBeInTheDocument();
    expect(screen.getByText('View Jobs')).toBeInTheDocument();
  });

  it('renders Applications dashboard card', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Track Applications')).toBeInTheDocument();
  });

  it('renders sign out button', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
