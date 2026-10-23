import type { AdminUser } from '@bszz-dojo/shared';

export class AdminUserResponse implements AdminUser {
  id: string;

  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  displayName: string | null;

  /** ISO 8601 timestamp */
  createdAt: string;
}
