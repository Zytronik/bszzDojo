import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  USER_SEARCH_LIMIT,
  normalizeDisplayName,
  normalizeUsername,
  usernameKey,
  type UpdateProfileRequest,
  type UserProfile,
  type UserSearchResult,
  type UserSettings,
} from '@bszz-dojo/shared';
import { ILike, Repository } from 'typeorm';
import { hashPassword, passwordMatches, rethrowUniqueViolation } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';
import { escapeLike } from '../common/escape-like';
import { toUserProfile } from './user-profile';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly tokens: TokenService,
  ) {}

  async getProfile(userId: string): Promise<UserProfile> {
    return toUserProfile(await this.findById(userId));
  }

  async updateProfile(userId: string, changes: UpdateProfileRequest): Promise<UserProfile> {
    const user = await this.findById(userId);
    const passwordChanged = changes.password !== undefined;

    // A session someone else got hold of must not be enough to lock the owner out.
    if (
      passwordChanged &&
      !(await passwordMatches(changes.currentPassword ?? '', user.passwordHash))
    ) {
      throw new BadRequestException('Das aktuelle Passwort ist falsch.');
    }

    if (changes.username !== undefined) {
      user.username = normalizeUsername(changes.username);
      user.usernameKey = usernameKey(changes.username);
    }
    if (changes.displayName !== undefined)
      user.displayName = normalizeDisplayName(changes.displayName);
    if (changes.rank !== undefined) user.rank = changes.rank;
    if (changes.password !== undefined) user.passwordHash = await hashPassword(changes.password);

    try {
      await this.users.save(user);
    } catch (error: unknown) {
      rethrowUniqueViolation(error);
    }
    if (passwordChanged) await this.tokens.revokeAllRefreshTokens(user.id);
    return toUserProfile(user);
  }

  async updateSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
    const result = await this.users.update(userId, { settings });
    if (result.affected === 0) throw new NotFoundException();
    return settings;
  }

  async search(query: string): Promise<UserSearchResult[]> {
    const pattern = `%${escapeLike(query.trim())}%`;
    const users = await this.users.find({
      select: { username: true, displayName: true },
      where: [{ usernameKey: ILike(pattern) }, { displayName: ILike(pattern) }],
      order: { usernameKey: 'ASC' },
      take: USER_SEARCH_LIMIT,
    });
    return users.map(({ username, displayName }) => ({ username, displayName }));
  }

  private async findById(userId: string): Promise<UserEntity> {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new NotFoundException();
    return user;
  }
}
