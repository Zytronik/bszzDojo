import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, type RegisterRequest } from '@bszz-dojo/shared';
import { IsOptional, IsString, Length } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/validation-messages';
import { IsDisplayName, IsUsername } from '../../common/validators';

export class RegisterBody implements RegisterRequest {
  /**
   * Letters, digits, `.`, `_` and `-`, no spaces. Unique, ignoring case; used to log in.
   * @example 'robin_hood'
   */
  @IsUsername({ message: VALIDATION_MESSAGES.username })
  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  @IsOptional()
  @IsDisplayName({ message: VALIDATION_MESSAGES.displayName })
  displayName?: string | null;

  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, { message: VALIDATION_MESSAGES.password })
  password: string;
}
