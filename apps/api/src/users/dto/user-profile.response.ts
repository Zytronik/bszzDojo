import { USER_ROLES, type UserProfile, type UserRole } from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { UserSettingsBody } from './user-settings.body';

export class UserProfileResponse implements UserProfile {
  /** @example '3f2b8c1e-6d4a-4b9e-9a51-2f6c1d7e8a90' */
  id: string;

  /** @example 'Robin Hood' */
  username: string;

  /** @example 'robin@example.com' */
  email: string;

  @ApiProperty({ enum: USER_ROLES })
  role: UserRole;

  settings: UserSettingsBody;
}
