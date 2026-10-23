import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  usernameKey,
  type AdminUser,
  type BadgeRequest,
  type GiveBadgeRequest,
  type RankId,
  type RemoveBadgeRequest,
} from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { toBadgeRequest } from '../badges/badge-mapper';
import { BadgeRequestEntity } from '../badges/badge-request.entity';
import { BadgeEntity } from '../badges/badge.entity';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(BadgeEntity)
    private readonly badges: Repository<BadgeEntity>,
    @InjectRepository(BadgeRequestEntity)
    private readonly requests: Repository<BadgeRequestEntity>,
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

  /** Scores, badges, requests and sessions go with it (foreign keys cascade). */
  async deleteUser(adminId: string, userId: string): Promise<void> {
    if (adminId === userId) throw new BadRequestException('Du kannst dich nicht selbst löschen.');
    const result = await this.users.delete(userId);
    if (result.affected === 0) throw new NotFoundException('Benutzer nicht gefunden.');
  }

  async setRank(username: string, rank: RankId | null): Promise<void> {
    const user = await this.findUser(username);
    await this.users.update(user.id, { rank });
  }

  async listBadgeRequests(): Promise<BadgeRequest[]> {
    const requests = await this.requests.find({
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
    return requests.map(toBadgeRequest);
  }

  async approveBadgeRequest(requestId: string, year: number): Promise<void> {
    const request = await this.requests.findOneBy({ id: requestId });
    if (!request) throw new NotFoundException('Anfrage nicht gefunden.');
    await this.requests.manager.transaction(async (manager) => {
      await manager.insert(BadgeEntity, {
        id: randomUUID(),
        userId: request.userId,
        name: request.name,
        year,
        place: request.place,
      });
      await manager.delete(BadgeRequestEntity, request.id);
    });
  }

  async rejectBadgeRequest(requestId: string): Promise<void> {
    const result = await this.requests.delete(requestId);
    if (result.affected === 0) throw new NotFoundException('Anfrage nicht gefunden.');
  }

  async giveBadge({ username, name, year, place }: GiveBadgeRequest): Promise<void> {
    const user = await this.findUser(username);
    await this.badges.insert({ id: randomUUID(), userId: user.id, name: name.trim(), year, place });
  }

  /** Name matching ignores case and surrounding spaces, as typed into the admin form. */
  async removeBadge({ username, name, year }: RemoveBadgeRequest): Promise<void> {
    const user = await this.findUser(username);
    const badge = await this.badges
      .createQueryBuilder('badge')
      .where('badge.userId = :userId', { userId: user.id })
      .andWhere('badge.year = :year', { year })
      .andWhere('lower(badge.name) = lower(:name)', { name: name.trim() })
      .getOne();
    if (!badge) throw new NotFoundException('Die angegebene Auszeichnung wurde nicht gefunden.');
    await this.badges.delete(badge.id);
  }

  private async findUser(username: string): Promise<UserEntity> {
    const user = await this.users.findOneBy({ usernameKey: usernameKey(username) });
    if (!user) throw new NotFoundException('Benutzer nicht gefunden.');
    return user;
  }
}
