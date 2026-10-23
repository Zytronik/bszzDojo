import {
  BADGE_EARLIEST_YEAR,
  BADGE_NAME_MAX_LENGTH,
  BADGE_PLACES,
  RANK_IDS,
  USERNAME_MAX_LENGTH,
  type ApproveBadgeRequest,
  type BadgePlace,
  type GiveBadgeRequest,
  type RankId,
  type RemoveBadgeRequest,
  type RemoveRankRequest,
  type SetRankRequest,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

/** Far enough ahead for a season that's already named after next year. */
const LATEST_YEAR = 2100;

export class SetRankBody implements SetRankRequest {
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  @ApiProperty({ enum: RANK_IDS })
  @IsIn(RANK_IDS)
  rank: RankId;
}

export class RemoveRankBody implements RemoveRankRequest {
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;
}

export class RemoveBadgeBody implements RemoveBadgeRequest {
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  /** @example 'Chlausschüsse' */
  @IsString()
  @IsNotEmpty()
  @MaxLength(BADGE_NAME_MAX_LENGTH)
  name: string;

  @IsInt()
  @Min(BADGE_EARLIEST_YEAR)
  @Max(LATEST_YEAR)
  year: number;
}

export class GiveBadgeBody extends RemoveBadgeBody implements GiveBadgeRequest {
  /** 1 gold, 2 silver, 3 bronze */
  @ApiProperty({ enum: BADGE_PLACES })
  @IsIn(BADGE_PLACES)
  place: BadgePlace;
}

export class ApproveBadgeBody implements ApproveBadgeRequest {
  /** The year the badge is recorded for. */
  @IsInt()
  @Min(BADGE_EARLIEST_YEAR)
  @Max(LATEST_YEAR)
  year: number;
}
