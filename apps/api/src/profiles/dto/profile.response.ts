import {
  BOW_TYPE_IDS,
  RANK_IDS,
  type BowTypeId,
  type DistanceProgress,
  type IsoDate,
  type PersonalBests,
  type Profile,
  type ProfileStats,
  type ProgressPoint,
  type ProgressSeries,
  type RankId,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { BadgeResponse } from '../../badges/dto/badge.response';
import { RankedScoreResponse, ScoreResponse } from '../../scores/dto/score.response';

export class ProfileStatsResponse implements ProfileStats {
  /** Average points per arrow over all rounds, two decimals; null without rounds. */
  @ApiProperty({ type: Number, nullable: true })
  averagePerArrow: number | null;

  totalScores: number;
}

export class PersonalBestsResponse implements PersonalBests {
  distance: number;

  scores: RankedScoreResponse[];
}

export class ProgressPointResponse implements ProgressPoint {
  shotOn: IsoDate;

  result: number;
}

export class ProgressSeriesResponse implements ProgressSeries {
  @ApiProperty({ enum: BOW_TYPE_IDS })
  bowType: BowTypeId;

  points: ProgressPointResponse[];
}

export class DistanceProgressResponse implements DistanceProgress {
  distance: number;

  series: ProgressSeriesResponse[];
}

export class ProfileResponse implements Profile {
  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  displayName: string | null;

  /** Club badge ("Abzeichen") */
  @ApiProperty({ enum: RANK_IDS, nullable: true })
  rank: RankId | null;

  stats: ProfileStatsResponse;

  /** Tournament placings, newest year first */
  badges: BadgeResponse[];

  /** Top 3 per distance, ordered by distance */
  personalBests: PersonalBestsResponse[];

  /** Every round per distance and bow type, oldest first */
  progress: DistanceProgressResponse[];

  /** The last 15 rounds, newest first */
  history: ScoreResponse[];
}
