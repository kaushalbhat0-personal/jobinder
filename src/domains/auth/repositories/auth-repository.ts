import type { User } from '../entities/user';

export interface AuthRepository {
  signInWithOAuth(provider: 'google'): Promise<void>;
  signInWithOtp(email: string): Promise<void>;
  signInWithPassword(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, name: string): Promise<User>;
  resetPasswordForEmail(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  verifyOtp(email: string, token: string): Promise<User>;
  signOut(): Promise<void>;
  getSession(): Promise<{ user: User } | null>;
  getUser(id: string): Promise<User | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
