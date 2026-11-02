import { isRecord, parseUserSettings, type UserProfile } from '@bszz-dojo/shared';
import { readStored, removeStored, writeStored } from '../core/stored';

/**
 * The logged-in user, kept on this device only so the app can start offline and show the data the
 * service worker cached. Never a token: offline, nothing can be changed. Cleared on logout and
 * whenever the server ends the session.
 */
const STORAGE_KEY = 'bszz-offline-user';

function isUserProfile(value: unknown): value is UserProfile {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['username'] === 'string' &&
    (value['displayName'] === null || typeof value['displayName'] === 'string') &&
    (value['role'] === 'user' || value['role'] === 'admin')
  );
}

/** Without a stored user (or storage), the app needs a connection to start. */
export function loadOfflineUser(): UserProfile | null {
  const stored = readStored(STORAGE_KEY);
  if (!isUserProfile(stored)) return null;
  return { ...stored, rank: stored.rank ?? null, settings: parseUserSettings(stored.settings) };
}

export function saveOfflineUser(user: UserProfile): void {
  writeStored(STORAGE_KEY, user);
}

export function clearOfflineUser(): void {
  removeStored(STORAGE_KEY);
}
