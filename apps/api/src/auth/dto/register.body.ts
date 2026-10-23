import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, type RegisterRequest } from '@bszz-dojo/shared';
import { IsString, Length } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/validation-messages';
import { IsEmailAddress, IsUsername } from '../../common/validators';

export class RegisterBody implements RegisterRequest {
  /**
   * Letters, digits, spaces, `.`, `_` and `-`. Unique, ignoring case.
   * @example 'Robin Hood'
   */
  @IsUsername({ message: VALIDATION_MESSAGES.username })
  username: string;

  /** Unique; used for password resets. */
  @IsEmailAddress({ message: VALIDATION_MESSAGES.email })
  email: string;

  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, { message: VALIDATION_MESSAGES.password })
  password: string;
}
