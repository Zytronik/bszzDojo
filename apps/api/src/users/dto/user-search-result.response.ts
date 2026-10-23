import type { UserSearchResult } from '@bszz-dojo/shared';

export class UserSearchResultResponse implements UserSearchResult {
  /** @example 'Robin Hood' */
  username: string;
}
