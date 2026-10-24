import {
  BOW_TYPE_IDS,
  MAX_ARROWS,
  MAX_DISTANCE,
  MAX_SHOT_OFFSET,
  POINTS_PER_ARROW,
  TARGET_SIZES,
  type BowTypeId,
  type IsoDate,
  type ScoreInput,
  type Shot,
  type TargetSize,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const DISTANCE = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;
const ARROWS = `Die Anzahl Pfeile muss zwischen 1 und ${MAX_ARROWS} liegen.`;
const COUNT = '10er und 9er müssen ganze Zahlen ab 0 sein.';
const RESULT = 'Das Resultat muss eine ganze Zahl ab 0 sein.';

const SHOT = 'Ungültige Pfeilposition.';

export class ShotBody implements Shot {
  /** Face units: center 0, the face's outer edge 1 (ring 1, or ring 6 on a spot); right is positive */
  @IsNumber({}, { message: SHOT })
  @Min(-MAX_SHOT_OFFSET, { message: SHOT })
  @Max(MAX_SHOT_OFFSET, { message: SHOT })
  x: number;

  /** Down is positive */
  @IsNumber({}, { message: SHOT })
  @Min(-MAX_SHOT_OFFSET, { message: SHOT })
  @Max(MAX_SHOT_OFFSET, { message: SHOT })
  y: number;
}

/** Cross-field rules (e.g. not more tens than arrows) are checked with the shared `scoreErrors`. */
export class ScoreBody implements ScoreInput {
  @ApiProperty({ enum: BOW_TYPE_IDS })
  @IsIn(BOW_TYPE_IDS, { message: 'Ungültige Bogenart.' })
  bowType: BowTypeId;

  @ApiProperty({ enum: TARGET_SIZES })
  @IsIn(TARGET_SIZES, { message: 'Ungültige Scheibengrösse.' })
  targetSize: TargetSize;

  @IsBoolean({ message: 'Spot muss ja oder nein sein.' })
  isSpot: boolean;

  /** @example '2026-10-22' */
  @IsISO8601({ strict: true }, { message: 'Ungültiges Datum.' })
  shotOn: IsoDate;

  /** Meters */
  @IsInt({ message: DISTANCE })
  @Min(1, { message: DISTANCE })
  @Max(MAX_DISTANCE, { message: DISTANCE })
  distance: number;

  @IsInt({ message: ARROWS })
  @Min(1, { message: ARROWS })
  @Max(MAX_ARROWS, { message: ARROWS })
  arrows: number;

  @IsInt({ message: COUNT })
  @Min(0, { message: COUNT })
  @Max(MAX_ARROWS, { message: COUNT })
  tens: number;

  @IsInt({ message: COUNT })
  @Min(0, { message: COUNT })
  @Max(MAX_ARROWS, { message: COUNT })
  nines: number;

  @IsInt({ message: RESULT })
  @Min(0, { message: RESULT })
  @Max(MAX_ARROWS * POINTS_PER_ARROW, { message: RESULT })
  result: number;

  /**
   * Every arrow's position, in the order shot, when entered on the target; leave out or `null`
   * otherwise. Then the count must be divisible by 3 and `result`, `tens` and `nines` must match.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_ARROWS)
  @ValidateNested({ each: true })
  @Type(() => ShotBody)
  shots: ShotBody[] | null;
}
