import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { AdminUser } from '@bszz-dojo/shared';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
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
}
