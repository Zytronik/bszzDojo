import { DOCUMENT, effect, inject, untracked } from '@angular/core';
import { isTheme, type Theme, type UserSettings } from '@bszz-dojo/shared';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { AuthStore } from '../auth/auth.store';
import { UsersApiService } from '../core/users-api.service';

export type SettingsSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SettingsState extends UserSettings {
  saveStatus: SettingsSaveStatus;
}

/** Quick toggles fire several changes; only the last one in this window is saved. */
const SAVE_DEBOUNCE_MS = 400;
/**
 * The last theme on this device, read by the inline script in index.html before Angular starts.
 * Only a paint cache: the account's setting is the source of truth.
 */
export const THEME_CACHE_KEY = 'bszz-theme';

/** Until the account's settings arrive: what index.html applied from the cache. */
function initialTheme(): Theme {
  const theme = inject(DOCUMENT).documentElement.dataset['theme'];
  return isTheme(theme) ? theme : 'dark';
}

/** The logged-in user's settings, loaded from and saved to their account. */
export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState<SettingsState>(() => ({ theme: initialTheme(), saveStatus: 'idle' })),
  withMethods((store, api = inject(UsersApiService)) => {
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const cancelPendingSave = (): void => {
      if (saveTimer !== null) clearTimeout(saveTimer);
      saveTimer = null;
    };

    const save = async (): Promise<void> => {
      saveTimer = null;
      patchState(store, { saveStatus: 'saving' });
      try {
        await api.saveSettings({ theme: store.theme() });
        patchState(store, { saveStatus: 'saved' });
      } catch {
        patchState(store, { saveStatus: 'error' });
      }
    };

    return {
      /** Replaces the local settings with the account's, without saving them back. */
      load(settings: UserSettings): void {
        cancelPendingSave();
        patchState(store, { ...settings, saveStatus: 'idle' });
      },

      setTheme(theme: Theme): void {
        patchState(store, { theme });
        cancelPendingSave();
        saveTimer = setTimeout(() => void save(), SAVE_DEBOUNCE_MS);
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
