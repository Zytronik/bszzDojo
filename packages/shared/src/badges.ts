import { BOW_TYPES, isBowTypeId, type BowTypeId } from './bow-types';
import { currentClubMonth } from './dates';
import { isInteger } from './guards';
import { MAX_DISTANCE } from './scores';

/*
 * Tournament placings ("Auszeichnungen"). Archers record their own in the settings, no admin
 * checks them. Only podium places are recorded; they count in the medal table.
 */

export const BADGE_PLACES = [1, 2, 3] as const;
export type BadgePlace = (typeof BADGE_PLACES)[number];

export const BADGE_PLACE_LABELS: Record<BadgePlace, string> = {
  1: 'Gold',
  2: 'Silber',
  3: 'Bronze',
};

/** Points per place in the medal table. */
export const BADGE_PLACE_POINTS: Record<BadgePlace, number> = { 1: 3, 2: 2, 3: 1 };

export const BADGE_KINDS = ['sm', 'club', 'tournament'] as const;
export type BadgeKind = (typeof BADGE_KINDS)[number];

export const BADGE_KIND_LABELS: Record<BadgeKind, string> = {
  sm: 'SM',
  club: 'Clubturnier',
  tournament: 'Turnier',
};

export const BADGE_VENUES = ['indoor', 'outdoor'] as const;
export type BadgeVenue = (typeof BADGE_VENUES)[number];

export const BADGE_VENUE_LABELS: Record<BadgeVenue, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
};

export const BADGE_TEXT_MAX_LENGTH = 100;
export const AGE_CATEGORY_MAX_LENGTH = 40;
export const BADGE_EARLIEST_YEAR = 1950;

/** Which fields a kind asks for; the others are always `null`. */
export const BADGE_KIND_FIELDS: Record<
  BadgeKind,
  { location: boolean; eventName: boolean; team: boolean; venue: boolean }
> = {
  sm: { location: true, eventName: false, team: true, venue: true },
  club: { location: false, eventName: true, team: false, venue: false },
  tournament: { location: true, eventName: true, team: true, venue: true },
};

/**
 * Body of `POST /api/users/me/badges`. Fields a kind doesn't ask for (`BADGE_KIND_FIELDS`) are
 * `null`; `is3d` only for outdoor placings. The age category is free text until the club settles
 * on a list.
 */
export interface BadgeInput {
  kind: BadgeKind;
  place: BadgePlace;
  year: number;
  bowType: BowTypeId;
  /** Meters */
  distance: number;
  location: string | null;
  eventName: string | null;
  team: boolean | null;
  venue: BadgeVenue | null;
  is3d: boolean | null;
  ageCategory: string | null;
}

/**
 * A recorded placing. Placings imported from the old app only have a name (as `eventName`), year
 * and place, so the other details can be `null`.
 */
export interface Badge extends Omit<BadgeInput, 'bowType' | 'distance'> {
  id: string;
  bowType: BowTypeId | null;
  distance: number | null;
}

/** A placing while it's being entered: anything can still be empty. */
export type BadgeDraft = { [K in keyof BadgeInput]: BadgeInput[K] | null };

export type BadgeFieldErrors = Partial<Record<keyof BadgeInput, string>>;

export function isBadgePlace(value: unknown): value is BadgePlace {
  return typeof value === 'number' && (BADGE_PLACES as readonly number[]).includes(value);
}

export function isBadgeKind(value: unknown): value is BadgeKind {
  return typeof value === 'string' && (BADGE_KINDS as readonly string[]).includes(value);
}

export function isBadgeVenue(value: unknown): value is BadgeVenue {
  return typeof value === 'string' && (BADGE_VENUES as readonly string[]).includes(value);
}

function trimmed(value: string | null): string | null {
  const text = value?.trim() ?? '';
  return text.length > 0 ? text : null;
}

/**
 * Clears what the kind doesn't ask for and trims the texts, so a form can keep hidden values
 * around while the kind is switched.
 */
export function normalizeBadgeInput<T extends BadgeDraft>(input: T): T {
  const fields = isBadgeKind(input.kind) ? BADGE_KIND_FIELDS[input.kind] : null;
  const venue = fields?.venue ? input.venue : null;
  return {
    ...input,
    location: fields?.location ? trimmed(input.location) : null,
    eventName: fields?.eventName ? trimmed(input.eventName) : null,
    team: fields?.team ? (input.team ?? false) : null,
    venue,
    is3d: venue === 'outdoor' ? (input.is3d ?? false) : null,
    ageCategory: trimmed(input.ageCategory),
  };
}

/**
 * What's wrong with a placing, by field, in German; empty if it's valid. Shared so the form shows
 * the same messages the API would answer with. Expects `normalizeBadgeInput` to have run.
 */
export function badgeFieldErrors(
  badge: BadgeDraft,
  currentYear: number = currentClubMonth().year,
): BadgeFieldErrors {
  const errors: BadgeFieldErrors = {};
  if (!isBadgeKind(badge.kind)) {
    errors.kind = 'Bitte wähle die Art der Auszeichnung.';
    return errors;
  }
  const fields = BADGE_KIND_FIELDS[badge.kind];

  if (!isBadgePlace(badge.place)) errors.place = 'Bitte wähle eine Platzierung.';
  if (!isInteger(badge.year) || badge.year < BADGE_EARLIEST_YEAR || badge.year > currentYear) {
    errors.year = `Das Jahr muss zwischen ${BADGE_EARLIEST_YEAR} und ${currentYear} liegen.`;
  }
  if (!isBowTypeId(badge.bowType)) errors.bowType = 'Bitte wähle eine Bogenkategorie.';
  if (!isInteger(badge.distance) || badge.distance < 1 || badge.distance > MAX_DISTANCE) {
    errors.distance = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;
  }
  if (fields.location && !badge.location) errors.location = 'Bitte gib den Ort ein.';
  if (fields.eventName && !badge.eventName)
    errors.eventName = 'Bitte gib den Namen des Events ein.';
  if (fields.venue && !isBadgeVenue(badge.venue)) errors.venue = 'Bitte wähle Indoor oder Outdoor.';
  for (const field of ['location', 'eventName'] as const) {
    if ((badge[field]?.length ?? 0) > BADGE_TEXT_MAX_LENGTH) {
      errors[field] = `Höchstens ${BADGE_TEXT_MAX_LENGTH} Zeichen.`;
    }
  }
  if ((badge.ageCategory?.length ?? 0) > AGE_CATEGORY_MAX_LENGTH) {
    errors.ageCategory = `Höchstens ${AGE_CATEGORY_MAX_LENGTH} Zeichen.`;
  }
  return errors;
}

/** The headline of a placing: "SM Outdoor 3D", "Chlausschiessen". */
export function badgeTitle(badge: Badge): string {
  if (badge.kind !== 'sm') return badge.eventName ?? BADGE_KIND_LABELS[badge.kind];
  const venue = badge.venue ? ` ${BADGE_VENUE_LABELS[badge.venue]}` : '';
  return `SM${venue}${badge.is3d ? ' 3D' : ''}`;
}

/** The rest, for a line below the title: "Turnier · Recurve · 70m · Team · Bern · U18". */
export function badgeDetails(badge: Badge): string {
  const parts = [
    badge.kind === 'sm' ? null : BADGE_KIND_LABELS[badge.kind],
    badge.kind === 'tournament' && badge.venue
      ? `${BADGE_VENUE_LABELS[badge.venue]}${badge.is3d ? ' 3D' : ''}`
      : null,
    badge.bowType ? BOW_TYPES[badge.bowType].name : null,
    badge.distance === null ? null : `${badge.distance}m`,
    badge.team ? 'Team' : null,
    badge.location,
    badge.ageCategory,
  ];
  return parts.filter((part) => part !== null).join(' · ');
}
