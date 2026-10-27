import { isRecord, parseUserSettings, type UserProfile } from '@bszz-dojo/shared';

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

export function loadOfflineUser(): UserProfile | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!isUserProfile(stored)) return null;
    return { ...stored, rank: stored.rank ?? null, settings: parseUserSettings(stored.settings) };
  } catch {
    // Unavailable storage (private mode) or a damaged entry: no offline start.
    return null;
  }
}

export function saveOfflineUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage can be unavailable (private mode); the app then needs a connection to start.
  }
}

export function clearOfflineUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing was stored then either.
  }
}
