import {
  BADGE_NAME_MAX_LENGTH,
  BADGE_PLACES,
  type BadgePlace,
  type BadgeRequestInput,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BadgeRequestBody implements BadgeRequestInput {
  /** @example 'Chlausschüsse 2023' */
  @IsString()
  @IsNotEmpty({ message: 'Bitte gib einen Namen ein.' })
  @MaxLength(BADGE_NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({ enum: BADGE_PLACES })
  @IsIn(BADGE_PLACES, { message: 'Die Platzierung muss 1, 2 oder 3 sein.' })
  place: BadgePlace;
}
