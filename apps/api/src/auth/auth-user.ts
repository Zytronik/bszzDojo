import type { Request } from 'express';

/** The authenticated user, from a verified access token. */
export interface AuthUser {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  authUser: AuthUser;
}
