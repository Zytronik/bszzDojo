import { isBowTypeId, type BowTypeId } from './bow-types';
import { isInteger, isOneOf, isRecord } from './guards';
import { MAX_DISTANCE, isTargetSize, type TargetSize } from './scores';

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

/**
 * What an archer is shooting with right now. New rounds and duels start from it, and the
 * dashboard and profiles open on its distance; it never hides anything.
 */
export interface ArcherySetup {
  bowType: BowTypeId;
  /** Meters */
  distance: number;
  targetSize: TargetSize;
  isSpot: boolean;
}

/** How many earlier setups the setup dialog offers with one tap */
export const RECENT_SETUPS = 3;

/** Stored per account in `users.settings`; `PUT /api/users/me/settings` replaces it. */
export interface UserSettings {
  theme: Theme;
  /** None until the first round or a setup is picked */
  setup: ArcherySetup | null;
  /** The last ones used, newest first, the current one included */
  recentSetups: ArcherySetup[];
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
  setup: null,
  recentSetups: [],
};

export function isTheme(value: unknown): value is Theme {
  return isOneOf(THEMES, value);
}

export function isArcherySetup(value: unknown): value is ArcherySetup {
  if (!isRecord(value)) return false;
  const { bowType, distance, targetSize, isSpot } = value;
  return (
    isBowTypeId(bowType) &&
    isInteger(distance) &&
    distance >= 1 &&
    distance <= MAX_DISTANCE &&
    isTargetSize(targetSize) &&
    typeof isSpot === 'boolean'
  );
}

export function sameSetup(a: ArcherySetup, b: ArcherySetup): boolean {
  return (
    a.bowType === b.bowType &&
    a.distance === b.distance &&
    a.targetSize === b.targetSize &&
    a.isSpot === b.isSpot
  );
}

/** `setup` becomes the current one and moves to the front of the recent ones. */
export function withSetup(settings: UserSettings, setup: ArcherySetup): UserSettings {
  const { bowType, distance, targetSize, isSpot } = setup;
  const current = { bowType, distance, targetSize, isSpot };
  const others = settings.recentSetups.filter((recent) => !sameSetup(recent, current));
  return {
    ...settings,
    setup: current,
    recentSetups: [current, ...others].slice(0, RECENT_SETUPS),
  };
}

/** Unknown or missing fields fall back to the defaults; invalid setups are dropped. */
export function parseUserSettings(value: unknown): UserSettings {
  if (!isRecord(value)) return { ...DEFAULT_USER_SETTINGS };
  const recent = value['recentSetups'];
  return {
    theme: isTheme(value['theme']) ? value['theme'] : DEFAULT_USER_SETTINGS.theme,
    setup: isArcherySetup(value['setup']) ? value['setup'] : null,
    recentSetups: Array.isArray(recent)
      ? recent.filter(isArcherySetup).slice(0, RECENT_SETUPS)
      : [],
  };
}
