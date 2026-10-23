import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { BadgeRequestInput } from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { BadgeRequestEntity } from './badge-request.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(BadgeRequestEntity)
    private readonly requests: Repository<BadgeRequestEntity>,
  ) {}

  async request(userId: string, input: BadgeRequestInput): Promise<void> {
    await this.requests.insert({ id: randomUUID(), userId, name: input.name.trim(), place: input.place });
  }
}
