import {
  BOW_TYPE_IDS,
  TARGET_SIZES,
  type BowTypeId,
  type IsoDate,
  type RankedScore,
  type Score,
  type ScoreComparison,
  type ScoreDetail,
  type Shot,
  type TargetSize,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ShotResponse implements Shot {
  x: number;

  y: number;
}

export class ScoreResponse implements Score {
  id: string;

  @ApiProperty({ enum: BOW_TYPE_IDS })
  bowType: BowTypeId;

  @ApiProperty({ enum: TARGET_SIZES })
  targetSize: TargetSize;

  isSpot: boolean;

  /** @example '2026-10-22' */
  shotOn: IsoDate;

  /** Meters */
  distance: number;

  arrows: number;

  tens: number;

  nines: number;

  result: number;

  /** Every arrow's position when entered on the target, else `null` */
  shots: ShotResponse[] | null;
}

export class RankedScoreResponse extends ScoreResponse implements RankedScore {
  /** 1-based place within its group */
  rank: number;
}

export class ScoreComparisonResponse implements ScoreComparison {
  /** The archer's other rounds with the same bow type, distance and arrow count */
  rounds: number;

  /** Their mean result, rounded; null without other rounds */
  @ApiProperty({ type: Number, nullable: true })
  average: number | null;

  /** Their best result; null without other rounds */
  @ApiProperty({ type: Number, nullable: true })
  best: number | null;
}

export class ScoreDetailResponse extends ScoreResponse implements ScoreDetail {
  /** @example 'robin_hood' */
  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  @ApiProperty({ type: String, nullable: true })
  displayName: string | null;

  comparison: ScoreComparisonResponse;
}
