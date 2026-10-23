import {
  BOW_TYPE_IDS,
  TARGET_SIZES,
  type BowTypeId,
  type IsoDate,
  type RankedScore,
  type Score,
  type TargetSize,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

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
}

export class RankedScoreResponse extends ScoreResponse implements RankedScore {
  /** 1-based place within its group */
  rank: number;
}
