import type { UserName } from './auth';
import type { Badge } from './badges';
import type { BowTypeId } from './bow-types';
import type { IsoDate } from './dates';
import type { RankId } from './ranks';
import type { RankedScore, Score } from './scores';

export const PERSONAL_BESTS_PER_DISTANCE = 3;
export const PROFILE_HISTORY_SIZE = 15;

export interface ProfileStats {
  /** Average points per arrow over all rounds, two decimals; null without rounds. */
  averagePerArrow: number | null;
  totalScores: number;
}

export interface PersonalBests {
  distance: number;
  scores: RankedScore[];
}

export interface ProgressPoint {
  shotOn: IsoDate;
  result: number;
}

/** Oldest first */
export interface ProgressSeries {
  bowType: BowTypeId;
  points: ProgressPoint[];
}

export interface DistanceProgress {
  distance: number;
  series: ProgressSeries[];
}

/** Response of `GET /api/profiles/:username`, visible to every logged-in user. */
export interface Profile extends UserName {
  rank: RankId | null;
  stats: ProfileStats;
  /** Newest year first */
  badges: Badge[];
  /** Ordered by distance */
  personalBests: PersonalBests[];
  /** Ordered by distance */
  progress: DistanceProgress[];
  /** Newest first */
  history: Score[];
}
