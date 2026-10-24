import type { UserName } from './auth';
import type { BowTypeId } from './bow-types';
import type { CalendarMonth, IsoDate } from './dates';
import type { TargetSize } from './scores';

/** In the order of their tabs */
export const LEADERBOARD_DISTANCES = [18, 8, 30] as const;
export type LeaderboardDistance = (typeof LEADERBOARD_DISTANCES)[number];
/** Only rounds with exactly this many arrows count, so results are comparable. */
export const LEADERBOARD_ARROWS = 30;
export const LEADERBOARD_SIZE = 10;

export interface LeaderboardEntry extends UserName {
  rank: number;
  /** With the bow type's handicap; what the board is sorted by. */
  adjustedResult: number;
  result: number;
  tens: number;
  nines: number;
  bowType: BowTypeId;
  targetSize: TargetSize;
  isSpot: boolean;
  shotOn: IsoDate;
}

export interface DistanceLeaderboard {
  distance: LeaderboardDistance;
  entries: LeaderboardEntry[];
}

export interface MedalStanding extends UserName {
  rank: number;
  gold: number;
  silver: number;
  bronze: number;
  points: number;
}

/** Response of `GET /api/rankings` */
export interface Rankings {
  month: CalendarMonth;
  allTime: DistanceLeaderboard[];
  monthly: DistanceLeaderboard[];
  medals: MedalStanding[];
}
