export interface AuthQueryContract {
  getCurrentUserId(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
  getUserEmail(userId: string): Promise<string | null>;
  getUser(userId: string): Promise<{ id: string; email: string; name: string | null } | null>;
}
