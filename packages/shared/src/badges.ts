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

export const BADGE_PLACE_POINTS: Record<BadgePlace, number> = { 1: 3, 2: 2, 3: 1 };

export const BADGE_KINDS = ['sm', 'club', 'tournament'] as const;
export type BadgeKind = (typeof BADGE_KINDS)[number];

export const BADGE_KIND_LABELS: Record<BadgeKind, string> = {
  sm: 'SM',
  club: 'Clubturnier',
  tournament: 'Nationales Turnier',
};

export const TOURNAMENT_TYPES = ['fita', 'indoor', '3d', 'field', 'team'] as const;
export type TournamentType = (typeof TOURNAMENT_TYPES)[number];

export const TOURNAMENT_TYPE_LABELS: Record<TournamentType, string> = {
  fita: 'FITA',
  indoor: 'Indoor',
  '3d': '3D',
  field: 'Field',
  team: 'Team',
};

export const BADGE_KIND_TOURNAMENT_TYPES: Record<BadgeKind, readonly TournamentType[]> = {
  sm: TOURNAMENT_TYPES,
  club: [],
  tournament: TOURNAMENT_TYPES.filter((type) => type !== 'team'),
};

export const AGE_CATEGORIES = ['U11', 'U13', 'U15', 'U18', 'U21', 'U50', '50+'] as const;
export type AgeCategory = (typeof AGE_CATEGORIES)[number];

export const BADGE_TEXT_MAX_LENGTH = 100;
export const BADGE_EARLIEST_YEAR = 1950;

/**
 * The others are always `null`; the team flag isn't asked for when the type is "Team". A national
 * tournament's event name is optional (most are just known by their place), and so is the
 * distance of an SM or a national tournament.
 */
export const BADGE_KIND_FIELDS: Record<
  BadgeKind,
  {
    location: boolean;
    eventName: 'required' | 'optional' | false;
    tournamentType: boolean;
    team: boolean;
    distance: 'required' | 'optional' | false;
  }
> = {
  sm: {
    location: true,
    eventName: false,
    tournamentType: true,
    team: true,
    distance: 'optional',
  },
  club: {
    location: false,
    eventName: 'required',
    tournamentType: false,
    team: false,
    distance: 'required',
  },
  tournament: {
    location: true,
    eventName: 'optional',
    tournamentType: true,
    team: false,
    distance: 'optional',
  },
};

/** Body of `POST /api/users/me/badges`. Fields a kind doesn't ask for are `null`. */
export interface BadgeInput {
  kind: BadgeKind;
  place: BadgePlace;
  year: number;
  bowType: BowTypeId;
  ageCategory: AgeCategory;
  tournamentType: TournamentType | null;
  location: string | null;
  eventName: string | null;
  team: boolean | null;
  /** Meters */
  distance: number | null;
}

/** Placings imported from the old app only have a name (as `eventName`), year and place. */
export interface Badge extends Omit<BadgeInput, 'bowType' | 'ageCategory'> {
  id: string;
  bowType: BowTypeId | null;
  ageCategory: AgeCategory | null;
}

export type BadgeDraft = { [K in keyof BadgeInput]: BadgeInput[K] | null };

export type BadgeFieldErrors = Partial<Record<keyof BadgeInput, string>>;

export function isBadgePlace(value: unknown): value is BadgePlace {
  return typeof value === 'number' && (BADGE_PLACES as readonly number[]).includes(value);
}

export function isBadgeKind(value: unknown): value is BadgeKind {
  return typeof value === 'string' && (BADGE_KINDS as readonly string[]).includes(value);
}

export function isTournamentType(value: unknown): value is TournamentType {
  return typeof value === 'string' && (TOURNAMENT_TYPES as readonly string[]).includes(value);
}

export function isAgeCategory(value: unknown): value is AgeCategory {
  return typeof value === 'string' && (AGE_CATEGORIES as readonly string[]).includes(value);
}

function trimmed(value: string | null): string | null {
  const text = value?.trim() ?? '';
  return text.length > 0 ? text : null;
}

/** Clears what the kind doesn't ask for, so a form can keep hidden values while the kind changes. */
export function normalizeBadgeInput<T extends BadgeDraft>(input: T): T {
  const fields = isBadgeKind(input.kind) ? BADGE_KIND_FIELDS[input.kind] : null;
  const tournamentType = fields?.tournamentType ? input.tournamentType : null;
  return {
    ...input,
    tournamentType,
    location: fields?.location ? trimmed(input.location) : null,
    eventName: fields?.eventName ? trimmed(input.eventName) : null,
    team: fields?.team && tournamentType !== 'team' ? (input.team ?? false) : null,
    distance: fields?.distance ? input.distance : null,
  };
}

/** Expects `normalizeBadgeInput` to have run. */
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
  if (!isAgeCategory(badge.ageCategory)) errors.ageCategory = 'Bitte wähle eine Alterskategorie.';
  if (
    fields.tournamentType &&
    !(
      isTournamentType(badge.tournamentType) &&
      BADGE_KIND_TOURNAMENT_TYPES[badge.kind].includes(badge.tournamentType)
    )
  ) {
    errors.tournamentType = 'Bitte wähle die Turnierart.';
  }
  if (
    fields.distance &&
    (fields.distance === 'required' || badge.distance !== null) &&
    (!isInteger(badge.distance) || badge.distance < 1 || badge.distance > MAX_DISTANCE)
  ) {
    errors.distance = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;
  }
  if (fields.location && !badge.location) errors.location = 'Bitte gib den Ort ein.';
  if (fields.eventName === 'required' && !badge.eventName)
    errors.eventName = 'Bitte gib den Namen des Events ein.';
  for (const field of ['location', 'eventName'] as const) {
    if ((badge[field]?.length ?? 0) > BADGE_TEXT_MAX_LENGTH) {
      errors[field] = `Höchstens ${BADGE_TEXT_MAX_LENGTH} Zeichen.`;
    }
  }
  return errors;
}

/** The headline of a placing: "SM FITA", "Chlausschiessen", or the place of an unnamed one. */
export function badgeTitle(badge: Badge): string {
  if (badge.kind !== 'sm')
    return badge.eventName ?? badge.location ?? BADGE_KIND_LABELS[badge.kind];
  return badge.tournamentType ? `SM ${TOURNAMENT_TYPE_LABELS[badge.tournamentType]}` : 'SM';
}

/** "Nationales Turnier · Field · Recurve · Bern · U18" */
export function badgeDetails(badge: Badge): string {
  const parts = [
    badge.kind === 'sm' ? null : BADGE_KIND_LABELS[badge.kind],
    badge.kind === 'tournament' && badge.tournamentType
      ? TOURNAMENT_TYPE_LABELS[badge.tournamentType]
      : null,
    badge.bowType ? BOW_TYPES[badge.bowType].name : null,
    badge.distance === null ? null : `${badge.distance}m`,
    badge.team ? 'Team' : null,
    // Already the title of an unnamed national tournament.
    badge.kind !== 'sm' && badge.eventName === null ? null : badge.location,
    badge.ageCategory,
  ];
  return parts.filter((part) => part !== null).join(' · ');
}
