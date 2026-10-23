import { parseUserSettings, type UserProfile } from '@bszz-dojo/shared';
import type { UserEntity } from './user.entity';

export function toUserProfile(user: UserEntity): UserProfile {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    rank: user.rank,
    role: user.role,
    settings: parseUserSettings(user.settings),
  };
}
