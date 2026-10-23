import type { UserSearchResult } from '@bszz-dojo/shared';

export class UserSearchResultResponse implements UserSearchResult {
  /** @example 'robin_hood' */
  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  displayName: string | null;
}
