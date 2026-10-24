import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RESET_PASSWORD, type AdminUser } from '@bszz-dojo/shared';
import { Repository } from 'typeorm';
import { hashPassword } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly tokens: TokenService,
  ) {}

  async listUsers(): Promise<AdminUser[]> {
    const users = await this.users.find({ order: { createdAt: 'DESC' } });
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async deleteUser(adminId: string, userId: string): Promise<void> {
    if (adminId === userId) throw new BadRequestException('Du kannst dich nicht selbst löschen.');
    const result = await this.users.delete(userId);
    if (result.affected === 0) throw new NotFoundException('Benutzer nicht gefunden.');
  }

  async resetPassword(userId: string): Promise<void> {
    const result = await this.users.update(userId, {
      passwordHash: await hashPassword(RESET_PASSWORD),
    });
    if (result.affected === 0) throw new NotFoundException('Benutzer nicht gefunden.');
    await this.tokens.revokeAllRefreshTokens(userId);
  }
}
