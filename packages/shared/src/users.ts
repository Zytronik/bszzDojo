import type { UserName } from './auth';
import type { RankId } from './ranks';

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
  /** New password */
  password?: string;
  /** Required to change the password. */
  currentPassword?: string;
}

/** Item of `GET /api/admin/users` */
export interface AdminUser extends UserName {
  id: string;
  /** ISO 8601 timestamp */
  createdAt: string;
}

/** Body of `PUT /api/admin/users/rank` */
export interface SetRankRequest {
  username: string;
  rank: RankId;
}

/** Body of `POST /api/admin/users/rank/remove` */
export interface RemoveRankRequest {
  username: string;
}
