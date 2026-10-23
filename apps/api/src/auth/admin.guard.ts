import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import type { AuthenticatedRequest } from './auth-user';

/**
 * Use after `JwtAuthGuard`. The role is read from the database, not the token, so taking admin
 * rights away applies immediately instead of when the access token expires.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.users.findOne({
      where: { id: request.authUser.id },
      select: { id: true, role: true },
    });
    if (user?.role !== 'admin') throw new ForbiddenException('Nur für Admins.');
    return true;
  }
}
