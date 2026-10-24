import type { RankId } from './ranks';
import type { UserName } from './auth';

export const USER_SEARCH_MIN_LENGTH = 1;
export const USER_SEARCH_LIMIT = 10;

/** Item of `GET /api/users/search?q=`, which matches usernames and display names. */
export type UserSearchResult = UserName;

/** Query of `GET /api/users/search` */
export interface UserSearchQuery {
  q: string;
}

/** Body of `PATCH /api/users/me`; fields left out stay as they are. */
export interface UpdateProfileRequest {
  username?: string;
  /** `null` or empty removes it. */
  displayName?: string | null;
  /** `null` removes it. */
  rank?: RankId | null;
  password?: string;
  /** Required to change the password. */
  currentPassword?: string;
}

/**
 * What `POST /api/admin/users/:id/reset-password` sets: there's no mail for a self-service reset,
 * so an admin resets it and tells the archer, who should change it right away.
 */
export const RESET_PASSWORD = 'Test1234!';

/** Item of `GET /api/admin/users` */
export interface AdminUser extends UserName {
  id: string;
  /** ISO 8601 timestamp */
  createdAt: string;
}
