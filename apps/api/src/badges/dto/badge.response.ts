import { BADGE_PLACES, type Badge, type BadgePlace, type BadgeRequest } from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class BadgeResponse implements Badge {
  id: string;

  /** @example 'Chlausschüsse' */
  name: string;

  /** @example 2023 */
  year: number;

  /** 1 gold, 2 silver, 3 bronze */
  @ApiProperty({ enum: BADGE_PLACES })
  place: BadgePlace;
}

export class BadgeRequestResponse implements BadgeRequest {
  id: string;

  username: string;

  /** @example 'Chlausschüsse 2023' */
  name: string;

  @ApiProperty({ enum: BADGE_PLACES })
  place: BadgePlace;

  /** ISO 8601 timestamp */
  createdAt: string;
}
