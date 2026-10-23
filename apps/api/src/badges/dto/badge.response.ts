import {
  BADGE_KINDS,
  BADGE_PLACES,
  BADGE_VENUES,
  BOW_TYPE_IDS,
  type Badge,
  type BadgeKind,
  type BadgePlace,
  type BadgeVenue,
  type BowTypeId,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class BadgeResponse implements Badge {
  id: string;

  /** SM, Clubturnier or Turnier */
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

  /** Meters; `null` only for placings imported from the old app */
  @ApiProperty({ type: Number, nullable: true })
  distance: number | null;

  /** SM and Turnier. @example 'Bern' */
  @ApiProperty({ type: String, nullable: true })
  location: string | null;

  /** Clubturnier and Turnier. @example 'Chlausschiessen' */
  @ApiProperty({ type: String, nullable: true })
  eventName: string | null;

  /** SM and Turnier */
  @ApiProperty({ type: Boolean, nullable: true })
  team: boolean | null;

  /** SM and Turnier */
  @ApiProperty({ enum: BADGE_VENUES, nullable: true })
  venue: BadgeVenue | null;

  /** Outdoor only */
  @ApiProperty({ type: Boolean, nullable: true })
  is3d: boolean | null;

  /** `null` only for placings imported from the old app. @example 'U18' */
  @ApiProperty({ type: String, nullable: true })
  ageCategory: string | null;
}
