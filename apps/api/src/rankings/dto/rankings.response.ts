import {
  BOW_TYPE_IDS,
  LEADERBOARD_DISTANCES,
  TARGET_SIZES,
  type BowTypeId,
  type CalendarMonth,
  type DistanceLeaderboard,
  type IsoDate,
  type LeaderboardDistance,
  type LeaderboardEntry,
  type Rankings,
  type TargetSize,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CalendarMonthResponse implements CalendarMonth {
  /** @example 2026 */
  year: number;

  /** 1–12 */
  month: number;
}

export class LeaderboardEntryResponse implements LeaderboardEntry {
  rank: number;

  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  displayName: string | null;

  /** With the bow type's handicap; what the board is sorted by. */
  adjustedResult: number;

  result: number;

  tens: number;

  nines: number;

  @ApiProperty({ enum: BOW_TYPE_IDS })
  bowType: BowTypeId;

  @ApiProperty({ enum: TARGET_SIZES })
  targetSize: TargetSize;

  isSpot: boolean;

  shotOn: IsoDate;
}

export class DistanceLeaderboardResponse implements DistanceLeaderboard {
  @ApiProperty({ enum: LEADERBOARD_DISTANCES })
  distance: LeaderboardDistance;

  entries: LeaderboardEntryResponse[];
}

export class RankingsResponse implements Rankings {
  /** The month of `monthly`, in the club's time zone. */
  month: CalendarMonthResponse;

  /** Best round per user ever, 30 arrows, with handicap. */
  allTime: DistanceLeaderboardResponse[];

  /** Best round per user this month, 30 arrows, with handicap. */
  monthly: DistanceLeaderboardResponse[];
}
