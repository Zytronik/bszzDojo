import {
  RANK_IDS,
  USER_ROLES,
  type RankId,
  type UserProfile,
  type UserRole,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { UserSettingsBody } from './user-settings.body';

export class UserProfileResponse implements UserProfile {
  /** @example '3f2b8c1e-6d4a-4b9e-9a51-2f6c1d7e8a90' */
  id: string;

  /** @example 'robin_hood' */
  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  displayName: string | null;

  /** Their club badge ("Abzeichen"), picked by themselves */
  @ApiProperty({ enum: RANK_IDS, nullable: true })
  rank: RankId | null;

  @ApiProperty({ enum: USER_ROLES })
  role: UserRole;

  settings: UserSettingsBody;
}
