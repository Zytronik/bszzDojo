import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type ResetPasswordRequest,
} from '@bszz-dojo/shared';
import { IsString, Length, MaxLength } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/validation-messages';

export class ResetPasswordBody implements ResetPasswordRequest {
  /** From the link in the reset mail. */
  @IsString()
  @MaxLength(200)
  token: string;

  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, { message: VALIDATION_MESSAGES.password })
  password: string;
}
