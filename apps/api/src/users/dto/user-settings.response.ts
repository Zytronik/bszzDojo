import type { Theme, UserSettings } from '@bszz-dojo/shared';

export class UserSettingsResponse implements UserSettings {
  /** @example 'dark' */
  theme: Theme;
}
