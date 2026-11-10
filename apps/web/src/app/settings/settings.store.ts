import { DOCUMENT, effect, inject, untracked } from '@angular/core';
import {
  DEFAULT_USER_SETTINGS,
  isTheme,
  parseUserSettings,
  withSetup,
  type ArcherySetup,
  type Theme,
  type UserSettings,
} from '@bszz-dojo/shared';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { AuthStore } from '../auth/auth.store';
import { UsersApiService } from '../core/users-api.service';
import { ToastStore } from '../layout/toast.store';

/** Quick toggles fire several changes; only the last one in this window is saved. */
const SAVE_DEBOUNCE_MS = 400;
/**
 * The last theme on this device, read by the inline script in index.html before Angular starts.
 * Only a paint cache: the account's setting is the source of truth.
 */
const THEME_CACHE_KEY = 'bszz-theme';

/** Until the account's settings arrive: what index.html applied from the cache. */
function initialTheme(): Theme {
  const theme = inject(DOCUMENT).documentElement.dataset['theme'];
  return isTheme(theme) ? theme : 'dark';
}

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState<UserSettings>(() => ({ ...DEFAULT_USER_SETTINGS, theme: initialTheme() })),
  withMethods((store) => {
    const api = inject(UsersApiService);
    const toasts = inject(ToastStore);
    const auth = inject(AuthStore);
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const cancelPendingSave = (): void => {
      if (saveTimer !== null) clearTimeout(saveTimer);
      saveTimer = null;
    };

    const save = async (): Promise<void> => {
      saveTimer = null;
      try {
        await api.saveSettings({
          theme: store.theme(),
          setup: store.setup(),
          recentSetups: store.recentSetups(),
        });
      } catch {
        // Offline the header's status pill already says so; the next change saves it then.
        if (!auth.isOffline()) toasts.error('Die Einstellungen konnten nicht gespeichert werden.');
      }
    };

    const saveSoon = (): void => {
      cancelPendingSave();
      saveTimer = setTimeout(() => void save(), SAVE_DEBOUNCE_MS);
    };

    return {
      /** Replaces the local settings with the account's, without saving them back. */
      load(settings: UserSettings): void {
        cancelPendingSave();
        // The last user cached for offline starts may come from an app version without setups.
        patchState(store, parseUserSettings(settings));
      },

      setTheme(theme: Theme): void {
        patchState(store, { theme });
        saveSoon();
      },

      /** Makes `setup` the current one, e.g. after a round was saved with it. */
      useSetup(setup: ArcherySetup): void {
        const settings = withSetup(
          { theme: store.theme(), setup: store.setup(), recentSetups: store.recentSetups() },
          setup,
        );
        patchState(store, { setup: settings.setup, recentSetups: settings.recentSetups });
        saveSoon();
      },
    };
  }),
  withHooks((store) => {
    const auth = inject(AuthStore);
    const document = inject(DOCUMENT);
    return {
      onInit(): void {
        // Only when the user changes: token refreshes also update the user and must not
        // overwrite a change that is still waiting to be saved.
        let loadedUserId: string | null = null;
        effect(() => {
          const user = auth.user();
          const userId = user?.id ?? null;
          if (userId === loadedUserId) return;
          loadedUserId = userId;
          // Logged out: keep the device's theme for the login page instead of resetting it.
          if (user) untracked(() => store.load(user.settings));
        });

        effect(() => {
          const theme = store.theme();
          document.documentElement.dataset['theme'] = theme;
          try {
            localStorage.setItem(THEME_CACHE_KEY, theme);
          } catch {
            // Storage can be unavailable (private mode); the theme then just isn't cached.
          }
        });
      },
    };
  }),
);
