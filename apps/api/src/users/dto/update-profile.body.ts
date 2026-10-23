import {
  ACCOUNT_FIELD_ERRORS,
  PASSWORD_MAX_LENGTH,
  RANK_IDS,
  PASSWORD_MIN_LENGTH,
  type RankId,
  type UpdateProfileRequest,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { IsDisplayName, IsUsername } from '../../common/validators';

export class UpdateProfileBody implements UpdateProfileRequest {
  @IsOptional()
  @IsUsername({ message: ACCOUNT_FIELD_ERRORS.username })
  username?: string;

  /** `null` or empty removes it. */
  @IsOptional()
  @IsDisplayName({ message: ACCOUNT_FIELD_ERRORS.displayName })
  displayName?: string | null;

  /** Their Abzeichen; `null` removes it. */
  @ApiProperty({ enum: RANK_IDS, nullable: true, required: false })
  @IsOptional()
  @IsIn(RANK_IDS, { message: 'Unbekanntes Abzeichen.' })
  rank?: RankId | null;

  /** New password */
  @IsOptional()
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, { message: ACCOUNT_FIELD_ERRORS.password })
  password?: string;

  /** Required to change the password. */
  @IsOptional()
  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword?: string;
}
