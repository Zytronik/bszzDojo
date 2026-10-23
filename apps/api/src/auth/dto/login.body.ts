import { PASSWORD_MAX_LENGTH, USERNAME_MAX_LENGTH, type LoginRequest } from '@bszz-dojo/shared';
import { IsString, MaxLength } from 'class-validator';

export class LoginBody implements LoginRequest {
  /** Case doesn't matter. */
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}
