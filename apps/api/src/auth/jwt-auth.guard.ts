import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './auth-user';
import { TokenService } from './token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    const user = token === null ? null : this.tokens.verifyAccessToken(token);
    if (!user) throw new UnauthorizedException();
    request.authUser = user;
    return true;
  }
}
