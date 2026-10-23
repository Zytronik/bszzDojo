import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DEFAULT_USER_SETTINGS,
  normalizeDisplayName,
  normalizeUsername,
  usernameKey,
  type AuthSession,
  type LoginRequest,
  type RegisterRequest,
} from '@bszz-dojo/shared';
import { compare, hash, hashSync } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { uniqueViolation } from '../common/database-errors';
import { toUserProfile } from '../users/user-profile';
import { UserEntity } from '../users/user.entity';
import { TokenService } from './token.service';

export const BCRYPT_ROUNDS = 10;
/** Compared against when the username doesn't exist, so both cases take as long. */
const DUMMY_PASSWORD_HASH = hashSync('not-a-real-password', BCRYPT_ROUNDS);

export const USERNAME_TAKEN = 'Benutzername ist bereits vergeben.';

/** PHP's `password_hash` writes `$2y$`, which is the same algorithm as `$2b$`. */
export function compatibleHash(passwordHash: string): string {
  return passwordHash.startsWith('$2y$') ? `$2b$${passwordHash.slice(4)}` : passwordHash;
}

export function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

export function passwordMatches(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, compatibleHash(passwordHash));
}

/** Throws a 409 with a German message if the write hit the username index. */
export function rethrowUniqueViolation(error: unknown): never {
  const constraint = uniqueViolation(error);
  if (constraint === 'UQ_users_username_key') throw new ConflictException(USERNAME_TAKEN);
  throw error;
}

/** A session plus the refresh token, which the controller puts in a cookie. */
export interface IssuedSession {
  session: AuthSession;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly tokens: TokenService,
  ) {}

  async register({ username, displayName, password }: RegisterRequest): Promise<IssuedSession> {
    const user = this.users.create({
      id: randomUUID(),
      username: normalizeUsername(username),
      usernameKey: usernameKey(username),
      displayName: normalizeDisplayName(displayName),
      passwordHash: await hashPassword(password),
      role: 'user',
      rank: null,
      settings: DEFAULT_USER_SETTINGS,
    });
    try {
      await this.users.insert(user);
    } catch (error: unknown) {
      rethrowUniqueViolation(error);
    }
    return this.issue(user);
  }

  async login({ username, password }: LoginRequest): Promise<IssuedSession> {
    const user = await this.users.findOneBy({ usernameKey: usernameKey(username) });
    const valid = await passwordMatches(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!user || !valid) throw new UnauthorizedException('Benutzername oder Passwort ist falsch.');
    return this.issue(user);
  }

  async refresh(refreshToken: string): Promise<IssuedSession> {
    const rotated = await this.tokens.rotateRefreshToken(refreshToken);
    const user = rotated && (await this.users.findOneBy({ id: rotated.userId }));
    if (!rotated || !user) throw new UnauthorizedException('Sitzung abgelaufen.');
    return { session: this.session(user), refreshToken: rotated.token };
  }

  logout(refreshToken: string): Promise<void> {
    return this.tokens.revokeRefreshToken(refreshToken);
  }

  private async issue(user: UserEntity): Promise<IssuedSession> {
    return {
      session: this.session(user),
      refreshToken: await this.tokens.createRefreshToken(user.id),
    };
  }

  private session(user: UserEntity): AuthSession {
    return {
      accessToken: this.tokens.signAccessToken({ id: user.id }),
      user: toUserProfile(user),
    };
  }
}
