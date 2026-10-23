import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, AuthUser } from './auth-user';

/** Only on routes guarded by `JwtAuthGuard` */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().authUser,
);
