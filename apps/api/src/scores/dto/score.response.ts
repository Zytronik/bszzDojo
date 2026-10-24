import {
  BOW_TYPE_IDS,
  TARGET_SIZES,
  type BowTypeId,
  type IsoDate,
  type RankedScore,
  type Score,
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
