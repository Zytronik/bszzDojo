import {
  AGE_CATEGORIES,
  BADGE_KINDS,
  BADGE_PLACES,
  BADGE_TEXT_MAX_LENGTH,
  BOW_TYPE_IDS,
  TOURNAMENT_TYPES,
  type AgeCategory,
  type BadgeInput,
  type BadgeKind,
  type BadgePlace,
  type BowTypeId,
  type TournamentType,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Types only; which fields a kind needs, the ranges and the German messages come from the shared
 * `badgeFieldErrors`, checked in the service.
 */
export class BadgeBody implements BadgeInput {
  /** SM, Clubturnier or Nationales Turnier */
  @ApiProperty({ enum: BADGE_KINDS })
  @IsIn(BADGE_KINDS)
  kind: BadgeKind;

  /** 1 gold, 2 silver, 3 bronze */
  @ApiProperty({ enum: BADGE_PLACES })
  @IsIn(BADGE_PLACES)
  place: BadgePlace;

  /** @example 2024 */
  @IsInt()
  year: number;

  @ApiProperty({ enum: BOW_TYPE_IDS })
  @IsIn(BOW_TYPE_IDS)
  bowType: BowTypeId;

  @ApiProperty({ enum: AGE_CATEGORIES })
  @IsIn(AGE_CATEGORIES)
  ageCategory: AgeCategory;

  /** SM and Nationales Turnier, else `null` */
  @ApiProperty({ enum: TOURNAMENT_TYPES, nullable: true })
  @IsOptional()
  @IsIn(TOURNAMENT_TYPES)
  tournamentType: TournamentType | null;

  /** SM and Nationales Turnier, else `null`. @example 'Bern' */
  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BADGE_TEXT_MAX_LENGTH)
  location: string | null;

  /** Clubturnier and Nationales Turnier, else `null`. @example 'Chlausschiessen' */
  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BADGE_TEXT_MAX_LENGTH)
  eventName: string | null;

  /** SM unless the tournament type is "team", else `null` */
  @ApiProperty({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  team: boolean | null;

  /** Clubturnier only, in meters, else `null`. @example 18 */
  @ApiProperty({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  distance: number | null;
}
