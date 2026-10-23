import type { AuthSession } from '@bszz-dojo/shared';
import { UserProfileResponse } from '../../users/dto/user-profile.response';

export class AuthSessionResponse implements AuthSession {
  /** JWT, valid for 15 minutes. Send as `Authorization: Bearer <token>`. */
  accessToken: string;

  user: UserProfileResponse;
}
