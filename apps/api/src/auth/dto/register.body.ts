import {
  ACCOUNT_FIELD_ERRORS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type RegisterRequest,
} from '@bszz-dojo/shared';
import { IsOptional, IsString, Length } from 'class-validator';
import { IsDisplayName, IsUsername } from '../../common/validators';

export class RegisterBody implements RegisterRequest {
  /**
   * Letters, digits, `.`, `_` and `-`, no spaces. Unique, ignoring case; used to log in.
   * @example 'robin_hood'
   */
  @IsUsername({ message: ACCOUNT_FIELD_ERRORS.username })
  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  @IsOptional()
  @IsDisplayName({ message: ACCOUNT_FIELD_ERRORS.displayName })
  displayName?: string | null;

  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, { message: ACCOUNT_FIELD_ERRORS.password })
  password: string;
}
