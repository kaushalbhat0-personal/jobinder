import { eventBus } from '@/shared/events/event-bus';

export const ProfileEventTypes = {
  ProfileUpdated: 'profile:updated',
  PreferencesChanged: 'profile:preferences-changed',
} as const;

export interface ProfileUpdatedPayload {
  userId: string;
  updatedFields: string[];
}
export interface ProfilePreferencesChangedPayload {
  userId: string;
  preferences: Record<string, unknown>;
}

export type ProfileEventPayloads = {
  [ProfileEventTypes.ProfileUpdated]: ProfileUpdatedPayload;
  [ProfileEventTypes.PreferencesChanged]: ProfilePreferencesChangedPayload;
};

export function emitProfileEvent<K extends keyof ProfileEventPayloads & string>(
  type: K,
  payload: ProfileEventPayloads[K],
): void {
  eventBus.emit(type as never, payload as never);
}
