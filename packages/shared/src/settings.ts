import { isOneOf, isRecord } from './guards';

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
  return isOneOf(THEMES, value);
}

/** Unknown or missing fields fall back to the defaults. */
export function parseUserSettings(value: unknown): UserSettings {
  if (!isRecord(value)) return { ...DEFAULT_USER_SETTINGS };
  return {
    theme: isTheme(value['theme']) ? value['theme'] : DEFAULT_USER_SETTINGS.theme,
  };
}
