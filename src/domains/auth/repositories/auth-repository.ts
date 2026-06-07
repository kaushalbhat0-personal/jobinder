export interface AuthRepository {
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<unknown>;
}
