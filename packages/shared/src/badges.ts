/** Tournament placings ("Auszeichnungen"); only podium places are recorded. */
export const BADGE_PLACES = [1, 2, 3] as const;
export type BadgePlace = (typeof BADGE_PLACES)[number];

export const BADGE_PLACE_LABELS: Record<BadgePlace, string> = {
  1: 'Gold',
  2: 'Silber',
  3: 'Bronze',
};

/** Points per place in the medal leaderboard. */
export const BADGE_PLACE_POINTS: Record<BadgePlace, number> = { 1: 3, 2: 2, 3: 1 };

export const BADGE_NAME_MAX_LENGTH = 100;
export const BADGE_EARLIEST_YEAR = 1950;

export function isBadgePlace(value: unknown): value is BadgePlace {
  return typeof value === 'number' && (BADGE_PLACES as readonly number[]).includes(value);
}

export interface Badge {
  id: string;
  /** e.g. "Chlausschüsse" or "SM Halle" */
  name: string;
  year: number;
  place: BadgePlace;
}

/** Body of `POST /api/badge-requests`: a user asks an admin to record a placing. */
export interface BadgeRequestInput {
  name: string;
  place: BadgePlace;
}

export interface BadgeRequest extends BadgeRequestInput {
  id: string;
  username: string;
  /** ISO 8601 timestamp */
  createdAt: string;
}

/** Body of `POST /api/admin/badges` */
export interface GiveBadgeRequest {
  username: string;
  name: string;
  year: number;
  place: BadgePlace;
}

/** Body of `POST /api/admin/badges/remove`: removes the user's badge with that name and year. */
export interface RemoveBadgeRequest {
  username: string;
  name: string;
  year: number;
}

/** Body of `POST /api/admin/badge-requests/:id/approve` */
export interface ApproveBadgeRequest {
  year: number;
}
