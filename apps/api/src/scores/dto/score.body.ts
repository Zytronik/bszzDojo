import {
  BOW_TYPE_IDS,
  MAX_ARROWS,
  MAX_DISTANCE,
  POINTS_PER_ARROW,
  TARGET_SIZES,
  type BowTypeId,
  type IsoDate,
  type ScoreInput,
  type TargetSize,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsISO8601, Max, Min } from 'class-validator';

/** Cross-field rules (e.g. not more tens than arrows) are checked with the shared `scoreErrors`. */
export class ScoreBody implements ScoreInput {
  @ApiProperty({ enum: BOW_TYPE_IDS })
  @IsIn(BOW_TYPE_IDS)
  bowType: BowTypeId;

  @ApiProperty({ enum: TARGET_SIZES })
  @IsIn(TARGET_SIZES)
  targetSize: TargetSize;

  @IsBoolean()
  isSpot: boolean;

  /** @example '2026-10-22' */
  @IsISO8601({ strict: true })
  shotOn: IsoDate;

  /** Meters */
  @IsInt()
  @Min(1)
  @Max(MAX_DISTANCE)
  distance: number;

  @IsInt()
  @Min(1)
  @Max(MAX_ARROWS)
  arrows: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ARROWS)
  tens: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ARROWS)
  nines: number;

  @IsInt()
  @Min(0)
  @Max(MAX_ARROWS * POINTS_PER_ARROW)
  result: number;
}
