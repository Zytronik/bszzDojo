import type { AdminUser } from '@bszz-dojo/shared';

export class AdminUserResponse implements AdminUser {
  id: string;

  username: string;

  /** ISO 8601 timestamp */
  createdAt: string;
}
