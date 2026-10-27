import { HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, untracked } from '@angular/core';
import { isRecord, scoreErrors, type ScoreInput } from '@bszz-dojo/shared';
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

/**
 * On this device until uploaded: localStorage, as rounds are small and must survive closing the
 * app. Per user, so someone else logging in on the device doesn't upload them as theirs.
 */
const STORAGE_KEY = 'bszz-pending-scores';

function isPendingScore(value: unknown): value is PendingScore {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['userId'] === 'string' &&
    isRecord(value['score'])
  );
}

function load(): PendingScore[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    // The upload checks the rounds again; here only that they're still complete.
    return Array.isArray(stored)
      ? stored.filter(isPendingScore).filter(({ score }) => scoreErrors(score).length === 0)
      : [];
  } catch {
    return [];
  }
}

function persist(pending: readonly PendingScore[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // Storage unavailable (private mode): the rounds then only wait while the app stays open.
  }
}

export const PendingScoresStore = signalStore(
  { providedIn: 'root' },
  withState<{ pending: PendingScore[]; syncing: boolean }>(() => ({
    pending: load(),
    syncing: false,
  })),
  withComputed((store, auth = inject(AuthStore)) => ({
    /** The logged-in user's rounds waiting for the upload */
    mine: computed(() => store.pending().filter((entry) => entry.userId === auth.user()?.id)),
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
        persist(pending);
      };
      const remove = (id: string): void =>
        update(store.pending().filter((entry) => entry.id !== id));

      return {
        add(score: ScoreInput): void {
          const userId = auth.user()?.id;
          if (!userId) return;
          update([...store.pending(), { id: crypto.randomUUID(), userId, score }]);
        },

        /** One after the other; stops at the first that can't reach the server. */
        async sync(): Promise<void> {
          if (store.syncing() || !auth.isAuthenticated() || auth.isOffline()) return;
          patchState(store, { syncing: true });
          let uploaded = 0;
          try {
            for (const entry of store.mine()) {
              try {
                await api.create({ ...entry.score, id: entry.id });
                remove(entry.id);
                uploaded++;
              } catch (error: unknown) {
                if (isUnreachable(error)) break;
                // Rejected (e.g. the rules changed since): it would fail every time.
                if (error instanceof HttpErrorResponse && error.status < 500) {
                  remove(entry.id);
                  toasts.error(
                    `Ein offline erfasster Score wurde abgelehnt: ${errorMessage(error)}`,
                  );
                } else {
                  break;
                }
              }
            }
          } finally {
            patchState(store, { syncing: false });
          }
          if (uploaded > 0) {
            toasts.success(
              uploaded === 1
                ? 'Ein offline erfasster Score wurde hochgeladen.'
                : `${uploaded} offline erfasste Scores wurden hochgeladen.`,
            );
          }
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
    },
  })),
);
