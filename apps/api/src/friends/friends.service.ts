import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { shownName, usernameKey, type Friend } from '@bszz-dojo/shared';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { FriendEntity } from './friend.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friends: Repository<FriendEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async list(userId: string): Promise<Friend[]> {
    const rows = await this.friends.find({ where: { userId }, relations: { friend: true } });
    return rows
      .map(({ friend }) => ({
        username: friend.username,
        displayName: friend.displayName,
        rank: friend.rank,
      }))
      .toSorted((a, b) => shownName(a).localeCompare(shownName(b), 'de'));
  }

  /** Adding someone twice is fine: the first row stays. */
  async add(userId: string, username: string): Promise<void> {
    const friend = await this.findUser(username);
    if (friend.id === userId) {
      throw new BadRequestException('Du kannst dich nicht selbst als Freund hinzufügen.');
    }
    await this.friends
      .createQueryBuilder()
      .insert()
      .values({ userId, friendId: friend.id })
      .orIgnore()
      .execute();
  }

  async remove(userId: string, username: string): Promise<void> {
    const friend = await this.findUser(username);
    await this.friends.delete({ userId, friendId: friend.id });
  }

  private async findUser(username: string): Promise<UserEntity> {
    const user = await this.users.findOneBy({ usernameKey: usernameKey(username) });
    if (!user) throw new NotFoundException('Benutzer nicht gefunden.');
    return user;
  }
}
