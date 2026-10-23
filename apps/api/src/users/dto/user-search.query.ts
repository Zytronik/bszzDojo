import {
  USERNAME_MAX_LENGTH,
  USER_SEARCH_MIN_LENGTH,
  type UserSearchQuery,
} from '@bszz-dojo/shared';
import { IsString, Length } from 'class-validator';

export class UserSearchQueryParams implements UserSearchQuery {
  /** Part of a username or display name, case-insensitive. */
  @IsString()
  @Length(USER_SEARCH_MIN_LENGTH, USERNAME_MAX_LENGTH)
  q: string;
}
