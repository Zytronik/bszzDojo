import type { Request } from 'express';

export interface AuthUser {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  authUser: AuthUser;
}
