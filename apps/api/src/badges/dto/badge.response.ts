import {
  AGE_CATEGORIES,
  BADGE_KINDS,
  BADGE_PLACES,
  BOW_TYPE_IDS,
  TOURNAMENT_TYPES,
  type AgeCategory,
  type Badge,
  type BadgeKind,
  type BadgePlace,
  type BowTypeId,
  type TournamentType,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class BadgeResponse implements Badge {
  id: string;

  /** SM, Clubturnier or Nationales Turnier */
  @ApiProperty({ enum: BADGE_KINDS })
  kind: BadgeKind;

  /** 1 gold, 2 silver, 3 bronze */
  @ApiProperty({ enum: BADGE_PLACES })
  place: BadgePlace;

  /** @example 2024 */
  year: number;

  /** `null` only for placings imported from the old app */
  @ApiProperty({ enum: BOW_TYPE_IDS, nullable: true })
  bowType: BowTypeId | null;

  /** `null` only for placings recorded before the categories were fixed */
  @ApiProperty({ enum: AGE_CATEGORIES, nullable: true })
  ageCategory: AgeCategory | null;

  /** SM and Nationales Turnier */
  @ApiProperty({ enum: TOURNAMENT_TYPES, nullable: true })
  tournamentType: TournamentType | null;

  /** SM and Nationales Turnier. @example 'Bern' */
  @ApiProperty({ type: String, nullable: true })
  location: string | null;

  /** Clubturnier; optional for a Nationales Turnier. @example 'Chlausschiessen' */
  @ApiProperty({ type: String, nullable: true })
  eventName: string | null;

  /** SM */
  @ApiProperty({ type: Boolean, nullable: true })
  team: boolean | null;

  /** Clubturnier, in meters */
  @ApiProperty({ type: Number, nullable: true })
  distance: number | null;
}
