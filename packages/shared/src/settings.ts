import { isRecord } from './guards';

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

/** Stored per account in `users.settings`; `PUT /api/users/me/settings` replaces it. */
export interface UserSettings {
  theme: Theme;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
};

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Settings from the database or an old client: unknown or missing fields fall back to defaults. */
export function parseUserSettings(value: unknown): UserSettings {
  if (!isRecord(value)) return { ...DEFAULT_USER_SETTINGS };
  return {
    theme: isTheme(value['theme']) ? value['theme'] : DEFAULT_USER_SETTINGS.theme,
  };
}
