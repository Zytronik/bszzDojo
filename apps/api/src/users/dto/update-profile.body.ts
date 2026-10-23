import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type UpdateProfileRequest,
} from '@bszz-dojo/shared';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/validation-messages';
import { IsEmailAddress, IsUsername } from '../../common/validators';

export class UpdateProfileBody implements UpdateProfileRequest {
  @IsOptional()
  @IsUsername({ message: VALIDATION_MESSAGES.username })
  username?: string;

  @IsOptional()
  @IsEmailAddress({ message: VALIDATION_MESSAGES.email })
  email?: string;

  /** New password */
  @IsOptional()
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, { message: VALIDATION_MESSAGES.password })
  password?: string;

  /** Required to change the email or the password. */
  @IsOptional()
  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword?: string;
}
