import {
  BOW_TYPE_IDS,
  MAX_DISTANCE,
  RECENT_SETUPS,
  TARGET_SIZES,
  THEMES,
  type ArcherySetup,
  type BowTypeId,
  type TargetSize,
  type Theme,
  type UserSettings,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const DISTANCE = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;

export class ArcherySetupBody implements ArcherySetup {
  @ApiProperty({ enum: BOW_TYPE_IDS })
  @IsIn(BOW_TYPE_IDS, { message: 'Ungültige Bogenart.' })
  bowType: BowTypeId;

  /** Meters */
  @IsInt({ message: DISTANCE })
  @Min(1, { message: DISTANCE })
  @Max(MAX_DISTANCE, { message: DISTANCE })
  distance: number;

  @ApiProperty({ enum: TARGET_SIZES })
  @IsIn(TARGET_SIZES, { message: 'Ungültige Scheibengrösse.' })
  targetSize: TargetSize;

  @IsBoolean({ message: 'Spot muss ja oder nein sein.' })
  isSpot: boolean;
}

export class UserSettingsBody implements UserSettings {
  /** @example 'dark' */
  @IsIn(THEMES)
  theme: Theme;

  /** What new rounds and duels start from; null until one is picked */
  @IsOptional()
  @ValidateNested()
  @Type(() => ArcherySetupBody)
  setup: ArcherySetupBody | null;

  /** The last setups used, newest first */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(RECENT_SETUPS)
  @ValidateNested({ each: true })
  @Type(() => ArcherySetupBody)
  recentSetups: ArcherySetupBody[];
}
