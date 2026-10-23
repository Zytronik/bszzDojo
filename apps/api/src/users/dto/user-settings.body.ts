import { THEMES, type Theme, type UserSettings } from '@bszz-dojo/shared';
import { IsIn } from 'class-validator';

export class UserSettingsBody implements UserSettings {
  /** @example 'dark' */
  @IsIn(THEMES)
  theme: Theme;
}
