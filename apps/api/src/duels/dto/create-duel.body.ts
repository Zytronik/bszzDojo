import {
  BOW_TYPE_IDS,
  DUEL_FORMATS,
  MAX_DISTANCE,
  TARGET_SIZES,
  type BowTypeId,
  type CreateDuelRequest,
  type DuelFormat,
  type TargetSize,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

const DISTANCE = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;

export class CreateDuelBody implements CreateDuelRequest {
  /** Username of who is challenged, matched ignoring case */
  @IsString({ message: 'Wähle einen Gegner.' })
  @MaxLength(30, { message: 'Benutzer nicht gefunden.' })
  opponent: string;

  @ApiProperty({ enum: DUEL_FORMATS })
  @IsIn(DUEL_FORMATS, { message: 'Ungültiges Format.' })
  format: DuelFormat;

  /** The challenger's bow; the opponent picks theirs when accepting */
  @ApiProperty({ enum: BOW_TYPE_IDS })
  @IsIn(BOW_TYPE_IDS, { message: 'Ungültige Bogenart.' })
  bowType: BowTypeId;

  /** Meters, for both */
  @IsInt({ message: DISTANCE })
  @Min(1, { message: DISTANCE })
  @Max(MAX_DISTANCE, { message: DISTANCE })
  distance: number;

  /** The challenger's face, cm; the opponent picks theirs when accepting */
  @ApiProperty({ enum: TARGET_SIZES })
  @IsIn(TARGET_SIZES, { message: 'Ungültige Scheibengrösse.' })
  targetSize: TargetSize;

  @IsBoolean({ message: 'Spot muss ja oder nein sein.' })
  isSpot: boolean;
}
