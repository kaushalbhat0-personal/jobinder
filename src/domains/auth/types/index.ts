import type { User } from '../entities/user';

export type { User };
export type AuthSession = { user: User; accessToken: string; refreshToken: string };
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';
export type OAuthProvider = 'google';
