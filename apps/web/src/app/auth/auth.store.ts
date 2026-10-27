import { computed, inject } from '@angular/core';
import {
  shownName,
  type AuthSession,
  type LoginRequest,
  type RegisterRequest,
  type UserProfile,
} from '@bszz-dojo/shared';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { errorMessage, isUnreachable } from '../core/error-message';
import { ToastStore } from '../layout/toast.store';
import { AuthApiService } from './auth-api.service';
import { clearOfflineUser, loadOfflineUser, saveOfflineUser } from './offline-session';

/**
 * `restoring` until the first refresh attempt at startup has finished. `offline`: the server
 * can't be reached, so there's no token; the last user is shown with the cached data.
 */
type AuthStatus = 'restoring' | 'authenticated' | 'offline' | 'anonymous';

interface AuthState {
  user: UserProfile | null;
  /** Kept in memory only; the refresh token is an httpOnly cookie the browser handles. */
  accessToken: string | null;
  status: AuthStatus;
  pending: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'restoring',
  pending: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed(({ status, user }) => ({
    isAuthenticated: computed(() => status() === 'authenticated' || status() === 'offline'),
    isOffline: computed(() => status() === 'offline'),
    isAdmin: computed(() => user()?.role === 'admin'),
    username: computed(() => user()?.username ?? ''),
    shownName: computed(() => {
      const current = user();
      return current ? shownName(current) : '';
    }),
  })),
  withMethods((store, api = inject(AuthApiService), toasts = inject(ToastStore)) => {
    let refreshing: Promise<string | null> | null = null;

    const applySession = (session: AuthSession): void => {
      saveOfflineUser(session.user);
      patchState(store, {
        user: session.user,
        accessToken: session.accessToken,
        status: 'authenticated',
        pending: false,
      });
    };

    const clearSession = (): void => {
      clearOfflineUser();
      patchState(store, { user: null, accessToken: null, status: 'anonymous', pending: false });
    };

    /** No connection: keep (or bring back) the last user instead of logging out. */
    const goOffline = (): void => {
      const user = store.user() ?? loadOfflineUser();
      if (user) patchState(store, { user, accessToken: null, status: 'offline', pending: false });
      else clearSession();
    };

    const submit = async (request: () => Promise<AuthSession>): Promise<boolean> => {
      patchState(store, { pending: true });
      try {
        applySession(await request());
        return true;
      } catch (error: unknown) {
        patchState(store, { pending: false });
        toasts.error(errorMessage(error));
        return false;
      }
    };

    /** Concurrent callers share one request, since each refresh rotates the cookie. */
    const refresh = (): Promise<string | null> => {
      refreshing ??= api
        .refresh()
        .then(
          (session) => {
            applySession(session);
            return session.accessToken;
          },
          (error: unknown) => {
            if (isUnreachable(error)) goOffline();
            else clearSession();
            return null;
          },
        )
        .finally(() => {
          refreshing = null;
        });
      return refreshing;
    };

    return {
      refresh,

      /** Run once at startup: the refresh cookie, if valid, logs the user back in. */
      async restoreSession(): Promise<void> {
        await refresh();
      },

      login(credentials: LoginRequest): Promise<boolean> {
        return submit(() => api.login(credentials));
      },

      register(request: RegisterRequest): Promise<boolean> {
        return submit(() => api.register(request));
      },

      async logout(): Promise<void> {
        try {
          await api.logout();
        } catch {
          // The session ends locally either way; the server one expires on its own.
        }
        clearSession();
      },

      /** After the user changed their own profile. */
      updateUser(user: UserProfile): void {
        saveOfflineUser(user);
        patchState(store, { user });
      },
    };
  }),
  withHooks((store) => ({
    onInit(): void {
      // Back online: get a token again, so changes can be saved.
      window.addEventListener('online', () => {
        if (store.isOffline()) void store.refresh();
      });
    },
  })),
);
