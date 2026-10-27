import type { UserName } from './auth';
import type { RankId } from './ranks';

/**
 * Item of `GET /api/users/me/friends`. Friends are one-sided, like following: adding someone
 * needs no confirmation and doesn't add you to their list.
 */
export interface Friend extends UserName {
  rank: RankId | null;
}
