import { eventBus } from '@/shared/events/event-bus';

export const AuthEventTypes = {
  UserSignedUp: 'auth:user-signed-up',
  UserSignedIn: 'auth:user-signed-in',
  UserSignedOut: 'auth:user-signed-out',
} as const;

export interface AuthUserSignedUpPayload {
  userId: string;
  email: string;
}
export interface AuthUserSignedInPayload {
  userId: string;
  email: string;
}
export interface AuthUserSignedOutPayload {
  userId: string;
}

export type AuthEventPayloads = {
  [AuthEventTypes.UserSignedUp]: AuthUserSignedUpPayload;
  [AuthEventTypes.UserSignedIn]: AuthUserSignedInPayload;
  [AuthEventTypes.UserSignedOut]: AuthUserSignedOutPayload;
};

export function emitAuthEvent<K extends keyof AuthEventPayloads & string>(
  type: K,
  payload: AuthEventPayloads[K],
): void {
  eventBus.emit(type as never, payload as never);
}
