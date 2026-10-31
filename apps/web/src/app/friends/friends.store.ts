import { computed, effect, inject, untracked } from '@angular/core';
import { shownName, usernameKey, type Friend, type UserName } from '@bszz-dojo/shared';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { FriendsApiService } from '../core/friends-api.service';
import { ToastStore } from '../layout/toast.store';

interface FriendsState {
  /** `null` until loaded for the logged-in user */
  friends: Friend[] | null;
  /** The username being added or removed */
  changing: string | null;
}

export const FriendsStore = signalStore(
  { providedIn: 'root' },
  withState<FriendsState>({ friends: null, changing: null }),
  withComputed(({ friends }) => ({
    keys: computed(() => new Set((friends() ?? []).map((friend) => usernameKey(friend.username)))),
  })),
  withMethods((store, api = inject(FriendsApiService), toasts = inject(ToastStore)) => {
    const load = async (): Promise<void> => {
      try {
        patchState(store, { friends: await api.list() });
      } catch (error: unknown) {
        toasts.error(errorMessage(error));
      }
    };

    const change = async (
      user: UserName,
      request: (username: string) => Promise<void>,
      message: string,
    ): Promise<void> => {
      patchState(store, { changing: user.username });
      try {
        await request(user.username);
        await load();
        toasts.success(message);
      } catch (error: unknown) {
        toasts.error(errorMessage(error));
      } finally {
        patchState(store, { changing: null });
      }
    };

    return {
      load,
      isFriend: (username: string): boolean => store.keys().has(usernameKey(username)),
      add: (user: UserName): Promise<void> =>
        change(user, (name) => api.add(name), `${shownName(user)} ist jetzt dein Freund.`),
      remove: (user: UserName): Promise<void> =>
        change(user, (name) => api.remove(name), `${shownName(user)} ist nicht mehr dein Freund.`),
    };
  }),
  withHooks((store, auth = inject(AuthStore)) => ({
    onInit(): void {
      // Per account: another user logging in on the device must not see the last one's friends.
      let loadedUserId: string | null = null;
      effect(() => {
        const userId = auth.user()?.id ?? null;
        const online = auth.status() === 'authenticated';
        untracked(() => {
          if (userId !== loadedUserId) patchState(store, { friends: null });
          if (userId && online && (userId !== loadedUserId || store.friends() === null)) {
            loadedUserId = userId;
            void store.load();
          } else if (!userId) {
            loadedUserId = null;
          }
        });
      });
    },
  })),
);
