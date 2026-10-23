import { computed, inject } from '@angular/core';
import {
  shownName,
  type AuthSession,
  type LoginRequest,
  type RegisterRequest,
  type UserProfile,
} from '@bszz-dojo/shared';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { errorMessage } from '../core/error-message';
import { AuthApiService } from './auth-api.service';

/** `restoring` until the first refresh attempt at startup has finished. */
export type AuthStatus = 'restoring' | 'authenticated' | 'anonymous';

interface AuthState {
  user: UserProfile | null;
  /** Kept in memory only; the refresh token is an httpOnly cookie the browser handles. */
  accessToken: string | null;
  status: AuthStatus;
  pending: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'restoring',
  pending: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed(({ status, user }) => ({
    isAuthenticated: computed(() => status() === 'authenticated'),
    isAdmin: computed(() => user()?.role === 'admin'),
    username: computed(() => user()?.username ?? ''),
    shownName: computed(() => {
      const current = user();
      return current ? shownName(current) : '';
    }),
  })),
  withMethods((store, api = inject(AuthApiService)) => {
    let refreshing: Promise<string | null> | null = null;

    const applySession = (session: AuthSession): void => {
      patchState(store, {
        user: session.user,
        accessToken: session.accessToken,
        status: 'authenticated',
        pending: false,
        error: null,
      });
    };

    const clearSession = (): void => {
      patchState(store, { user: null, accessToken: null, status: 'anonymous', pending: false });
    };

    const submit = async (request: () => Promise<AuthSession>): Promise<boolean> => {
      patchState(store, { pending: true, error: null });
      try {
        applySession(await request());
        return true;
      } catch (error: unknown) {
        patchState(store, { pending: false, error: errorMessage(error) });
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
          () => {
            clearSession();
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
        patchState(store, { user });
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
);
