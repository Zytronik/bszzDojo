import { HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, untracked } from '@angular/core';
import { isRecord, scoreErrors, type Score, type ScoreInput } from '@bszz-dojo/shared';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthStore } from '../auth/auth.store';
import { errorMessage, isUnreachable } from '../core/error-message';
import { ScoresApiService } from '../core/scores-api.service';
import { ToastStore } from '../layout/toast.store';

/** A round entered without a connection, waiting to be uploaded. */
export interface PendingScore {
  /** Sent along, so an upload repeated after a lost answer isn't recorded twice. */
  id: string;
  userId: string;
  score: ScoreInput;
}

/** A round of the server's deleted without a connection, kept to show the profile without it. */
export interface PendingDeletion {
  id: string;
  userId: string;
  score: Score;
}

/** What's waiting for the server, to merge into its answers (`scores/pending-merge.ts`) */
export interface PendingChanges {
  added: Score[];
  deleted: Score[];
}

/**
 * On this device until synced: localStorage, as rounds are small and must survive closing the
 * app. Per user, so someone else logging in on the device doesn't upload them as theirs.
 */
const STORAGE_KEY = 'bszz-pending-scores';
const DELETIONS_KEY = 'bszz-pending-deletions';
const RETRY_INTERVAL_MS = 30_000;

/** Both queues have the same shape; the rounds themselves are checked again by the server. */
function isQueued<T extends PendingScore | PendingDeletion>(value: unknown): value is T {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['userId'] === 'string' &&
    isRecord(value['score'])
  );
}

function loadQueue<T extends PendingScore | PendingDeletion>(key: string): T[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(stored) ? stored.filter((entry) => isQueued<T>(entry)) : [];
  } catch {
    return [];
  }
}

function persist(key: string, entries: readonly (PendingScore | PendingDeletion)[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    // Storage unavailable (private mode): the rounds then only wait while the app stays open.
  }
}

export const PendingScoresStore = signalStore(
  { providedIn: 'root' },
  withState<{
    pending: PendingScore[];
    deletions: PendingDeletion[];
    syncing: boolean;
    uploads: number;
  }>(() => ({
    // Only rounds that are still complete: an upload of one that isn't would fail every time.
    pending: loadQueue<PendingScore>(STORAGE_KEY).filter(
      ({ score }) => scoreErrors(score).length === 0,
    ),
    deletions: loadQueue<PendingDeletion>(DELETIONS_KEY),
    syncing: false,
    /** Counts syncs that changed something on the server, so pages fetch its data again */
    uploads: 0,
  })),
  withComputed((store, auth = inject(AuthStore)) => ({
    /** The logged-in user's rounds waiting for the upload */
    mine: computed(() => store.pending().filter((entry) => entry.userId === auth.user()?.id)),
    myDeletions: computed(() =>
      store.deletions().filter((entry) => entry.userId === auth.user()?.id),
    ),
  })),
  withComputed((store) => ({
    /** As rounds, to show them with the server's before they're uploaded */
    myScores: computed((): Score[] => store.mine().map(({ id, score }) => ({ ...score, id }))),
    pendingIds: computed(() => new Set(store.mine().map((entry) => entry.id))),
  })),
  withComputed((store) => ({
    changes: computed(
      (): PendingChanges => ({
        added: store.myScores(),
        deleted: store.myDeletions().map((entry) => entry.score),
      }),
    ),
    waiting: computed(() => store.mine().length + store.myDeletions().length),
  })),
  withMethods(
    (
      store,
      auth = inject(AuthStore),
      api = inject(ScoresApiService),
      toasts = inject(ToastStore),
    ) => {
      const update = (pending: PendingScore[]): void => {
        patchState(store, { pending });
        persist(STORAGE_KEY, pending);
      };
      const remove = (id: string): void =>
        update(store.pending().filter((entry) => entry.id !== id));
      const updateDeletions = (deletions: PendingDeletion[]): void => {
        patchState(store, { deletions });
        persist(DELETIONS_KEY, deletions);
      };
      const removeDeletion = (id: string): void =>
        updateDeletions(store.deletions().filter((entry) => entry.id !== id));

      /** False when the server can't be reached, to stop syncing. */
      const deleteOnServer = async (entry: PendingDeletion): Promise<boolean> => {
        try {
          await api.delete(entry.id);
        } catch (error: unknown) {
          if (isUnreachable(error)) {
            auth.markOffline();
            return false;
          }
          if (!(error instanceof HttpErrorResponse) || error.status >= 500) return false;
          // 404: already gone, e.g. deleted on another device. Anything else would fail every time.
          if (error.status !== 404) {
            toasts.error(
              `Ein offline gelöschter Score wurde nicht gelöscht: ${errorMessage(error)}`,
            );
          }
        }
        removeDeletion(entry.id);
        return true;
      };

      /** One after the other; stops at the first that can't reach the server. */
      const sync = async (): Promise<void> => {
        if (store.syncing() || !auth.isAuthenticated() || auth.isOffline()) return;
        patchState(store, { syncing: true });
        let uploaded = 0;
        let deleted = 0;
        try {
          for (const entry of store.mine()) {
            try {
              await api.create({ ...entry.score, id: entry.id });
              remove(entry.id);
              uploaded++;
            } catch (error: unknown) {
              if (isUnreachable(error)) {
                auth.markOffline();
                break;
              }
              // Rejected (e.g. the rules changed since): it would fail every time.
              if (error instanceof HttpErrorResponse && error.status < 500) {
                remove(entry.id);
                toasts.error(`Ein offline erfasster Score wurde abgelehnt: ${errorMessage(error)}`);
              } else {
                break;
              }
            }
          }
          // Only once the uploads went through, so the server answers.
          if (store.mine().length === 0) {
            for (const entry of store.myDeletions()) {
              if (!(await deleteOnServer(entry))) break;
              deleted++;
            }
          }
        } finally {
          patchState(store, { syncing: false });
        }
        if (uploaded > 0 || deleted > 0) patchState(store, { uploads: store.uploads() + 1 });
      };

      return {
        sync,

        /** Without a connection: gone from the views now, from the server once it's back. */
        deleteLater(score: Score): void {
          const userId = auth.user()?.id;
          if (!userId) return;
          if (store.pendingIds().has(score.id)) {
            remove(score.id);
            return;
          }
          if (store.deletions().some((entry) => entry.id === score.id)) return;
          updateDeletions([...store.deletions(), { id: score.id, userId, score }]);
        },

        /** The round's id, which it keeps on the server */
        add(score: ScoreInput): string | null {
          const userId = auth.user()?.id;
          if (!userId) return null;
          const id = crypto.randomUUID();
          update([...store.pending(), { id, userId, score }]);
          return id;
        },

        /** Offline: try to get a session again first, which syncs once it's back. */
        retry(): void {
          if (store.waiting() === 0) return;
          if (auth.isOffline()) void auth.refresh();
          else void sync();
        },
      };
    },
  ),
  withHooks((store, auth = inject(AuthStore)) => ({
    onInit(): void {
      // Whenever there's a session with a connection again: at startup, after login, back online.
      effect(() => {
        if (auth.status() === 'authenticated') untracked(() => void store.sync());
      });
      // Browsers don't always report getting a connection back (iOS apps on the home screen),
      // so also when the app comes to the front and every so often while rounds wait.
      window.addEventListener('online', () => store.retry());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') store.retry();
      });
      setInterval(() => store.retry(), RETRY_INTERVAL_MS);
    },
  })),
);

/** Fetches a page's data again after offline rounds were uploaded. Injection context only. */
export function reloadAfterUploads(
  store: InstanceType<typeof PendingScoresStore>,
  reload: () => void,
): void {
  let seen = store.uploads();
  effect(() => {
    const uploads = store.uploads();
    if (uploads !== seen) untracked(reload);
    seen = uploads;
  });
}
