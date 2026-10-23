import {
  AGE_CATEGORY_MAX_LENGTH,
  BADGE_KINDS,
  BADGE_PLACES,
  BADGE_TEXT_MAX_LENGTH,
  BADGE_VENUES,
  BOW_TYPE_IDS,
  type BadgeInput,
  type BadgeKind,
  type BadgePlace,
  type BadgeVenue,
  type BowTypeId,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Types only; which fields a kind needs, the ranges and the German messages come from the shared
 * `badgeFieldErrors`, checked in the service.
 */
export class BadgeBody implements BadgeInput {
  /** SM, Clubturnier or Turnier */
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

  /** Meters. @example 70 */
  @IsInt()
  distance: number;

  /** SM and Turnier, else `null`. @example 'Bern' */
  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BADGE_TEXT_MAX_LENGTH)
  location: string | null;

  /** Clubturnier and Turnier, else `null`. @example 'Chlausschiessen' */
  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BADGE_TEXT_MAX_LENGTH)
  eventName: string | null;

  /** SM and Turnier, else `null` */
  @ApiProperty({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  team: boolean | null;

  /** SM and Turnier, else `null` */
  @ApiProperty({ enum: BADGE_VENUES, nullable: true })
  @IsOptional()
  @IsIn(BADGE_VENUES)
  venue: BadgeVenue | null;

  /** Outdoor only, else `null` */
  @ApiProperty({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  is3d: boolean | null;

  /** Required for every kind; free text for now. @example 'U18' */
  @IsString()
  @MaxLength(AGE_CATEGORY_MAX_LENGTH)
  ageCategory: string;
}
