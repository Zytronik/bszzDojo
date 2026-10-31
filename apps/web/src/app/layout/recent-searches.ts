import { Injectable, computed, inject, signal } from '@angular/core';
import { isRecord, usernameKey, type UserSearchResult } from '@bszz-dojo/shared';
import { AuthStore } from '../auth/auth.store';

/**
 * Per device in localStorage, like the score setup: only a convenience for the next search. Kept
 * for the user who opened them, so someone else logging in on the device doesn't see them.
 */
const STORAGE_KEY = 'bszz-recent-searches';
const RECENT_LIMIT = 5;

interface StoredRecent {
  userId: string;
  profiles: UserSearchResult[];
}

function isProfile(value: unknown): value is UserSearchResult {
  return (
    isRecord(value) &&
    typeof value['username'] === 'string' &&
    (value['displayName'] === null || typeof value['displayName'] === 'string')
  );
}

function load(): StoredRecent | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!isRecord(stored) || typeof stored['userId'] !== 'string') return null;
    const profiles = Array.isArray(stored['profiles']) ? stored['profiles'] : [];
    return { userId: stored['userId'], profiles: profiles.filter(isProfile).slice(0, RECENT_LIMIT) };
  } catch {
    return null;
  }
}

/** The profiles last opened from the search, newest first, shown before anything is typed. */
@Injectable({ providedIn: 'root' })
export class RecentSearches {
  private readonly auth = inject(AuthStore);
  private readonly stored = signal(load());

  readonly profiles = computed((): UserSearchResult[] => {
    const stored = this.stored();
    return stored && stored.userId === this.auth.user()?.id ? stored.profiles : [];
  });

  add({ username, displayName }: UserSearchResult): void {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    const key = usernameKey(username);
    const profiles = [
      { username, displayName },
      ...this.profiles().filter((profile) => usernameKey(profile.username) !== key),
    ].slice(0, RECENT_LIMIT);
    this.stored.set({ userId, profiles });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, profiles }));
    } catch {
      // Storage unavailable (private mode): remembered only while the app stays open.
    }
  }
}
