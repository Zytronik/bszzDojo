import { computed, effect, inject, untracked } from '@angular/core';
import type { DuelList, DuelSummary } from '@bszz-dojo/shared';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthStore } from '../auth/auth.store';
import { DuelsApiService } from '../core/duels-api.service';

/** Often enough to notice an invitation while the app is open, rarely enough to cost nothing. */
const POLL_INTERVAL_MS = 20_000;

/**
 * The logged-in user's invitations and open duels, for the dashboard, and a toast for
 * invitations that arrive while the app is open.
 */
export const DuelsStore = signalStore(
  { providedIn: 'root' },
  withState<{
    list: DuelList | null;
    /** Invitations already shown or toasted, so each is announced once */
    seen: string[];
    loading: boolean;
  }>({ list: null, seen: [], loading: false }),
  withComputed((store) => ({
    invitations: computed((): DuelSummary[] => store.list()?.invitations ?? []),
    open: computed((): DuelSummary[] => store.list()?.open ?? []),
    /** The newest invitation that came in since the list was first loaded */
    announcement: computed(
      (): DuelSummary | null =>
        store.list()?.invitations.find((duel) => !store.seen().includes(duel.id)) ?? null,
    ),
  })),
  withMethods((store, auth = inject(AuthStore), api = inject(DuelsApiService)) => ({
    async refresh(): Promise<void> {
      if (!auth.isAuthenticated() || auth.isOffline() || store.loading()) return;
      patchState(store, { loading: true });
      try {
        const list = await api.list();
        // The first list is on the dashboard anyway; only later invitations get a toast.
        const seen =
          store.list() === null ? list.invitations.map((duel) => duel.id) : store.seen();
        patchState(store, { list, seen });
      } catch {
        // Polled in the background: the next poll tries again, pages show their own errors.
      } finally {
        patchState(store, { loading: false });
      }
    },

    dismiss(id: string): void {
      patchState(store, { seen: [...store.seen(), id] });
    },
  })),
  withHooks((store, auth = inject(AuthStore)) => ({
    onInit(): void {
      effect(() => {
        if (auth.status() === 'authenticated') untracked(() => void store.refresh());
        else if (!auth.isAuthenticated()) patchState(store, { list: null, seen: [] });
      });
      setInterval(() => {
        if (document.visibilityState === 'visible') void store.refresh();
      }, POLL_INTERVAL_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void store.refresh();
      });
    },
  })),
);
