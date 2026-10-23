import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  badgeFieldErrors,
  normalizeBadgeInput,
  type Badge,
  type BadgeInput,
} from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { toBadge } from './badge-mapper';
import { BadgeEntity } from './badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly badges: Repository<BadgeEntity>,
  ) {}

  async list(userId: string): Promise<Badge[]> {
    const badges = await this.badges.find({
      where: { userId },
      order: { year: 'DESC', place: 'ASC', createdAt: 'DESC' },
    });
    return badges.map(toBadge);
  }

  async create(userId: string, input: BadgeInput): Promise<Badge> {
    const badge = normalizeBadgeInput(input);
    const errors = Object.values(badgeFieldErrors(badge));
    if (errors.length > 0) throw new BadRequestException(errors);

    const entity = this.badges.create({ id: randomUUID(), userId, ...badge });
    await this.badges.insert(entity);
    return toBadge(entity);
  }

  /** Users can only delete their own placings. */
  async delete(userId: string, badgeId: string): Promise<void> {
    const result = await this.badges.delete({ id: badgeId, userId });
    if (result.affected === 0) throw new NotFoundException('Auszeichnung nicht gefunden.');
  }
}
