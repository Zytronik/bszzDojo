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

const DISTANCE = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;
const ARROWS = `Die Anzahl Pfeile muss zwischen 1 und ${MAX_ARROWS} liegen.`;
const COUNT = '10er und 9er müssen ganze Zahlen ab 0 sein.';
const RESULT = 'Das Resultat muss eine ganze Zahl ab 0 sein.';

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
}
