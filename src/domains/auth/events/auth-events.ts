import { eventBus } from '@/shared/events/event-bus';

export const AuthEventTypes = {
  UserSignedUp: 'auth:user-signed-up',
  UserSignedIn: 'auth:user-signed-in',
  UserSignedOut: 'auth:user-signed-out',
  PasswordResetRequested: 'auth:password-reset-requested',
  PasswordResetCompleted: 'auth:password-reset-completed',
} as const;

export interface AuthUserSignedUpPayload {
  userId: string;
  email: string;
}
export interface AuthUserSignedInPayload {
  userId: string;
  email: string;
  method?: string;
}
export interface AuthUserSignedOutPayload {
  userId: string;
}
export interface AuthPasswordResetRequestedPayload {
  email: string;
}
export interface AuthPasswordResetCompletedPayload {
  userId: string;
}

export type AuthEventPayloads = {
  [AuthEventTypes.UserSignedUp]: AuthUserSignedUpPayload;
  [AuthEventTypes.UserSignedIn]: AuthUserSignedInPayload;
  [AuthEventTypes.UserSignedOut]: AuthUserSignedOutPayload;
  [AuthEventTypes.PasswordResetRequested]: AuthPasswordResetRequestedPayload;
  [AuthEventTypes.PasswordResetCompleted]: AuthPasswordResetCompletedPayload;
};

export function emitAuthEvent<K extends keyof AuthEventPayloads & string>(
  type: K,
  payload: AuthEventPayloads[K],
): void {
  eventBus.emit(type as never, payload as never);
}
