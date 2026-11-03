import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { sameSecret } from './secret-token';

/**
 * For routes Vercel Cron calls: it sends `Authorization: Bearer <CRON_SECRET>`. Without the env
 * var nobody gets in, so a missing secret can't open the route.
 */
@Injectable()
export class CronGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('CRON_SECRET');
    const header = context.switchToHttp().getRequest<Request>().headers.authorization ?? '';
    if (!secret || !sameSecret(header, `Bearer ${secret}`)) throw new UnauthorizedException();
    return true;
  }
}
