import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { isRecord } from '@bszz-dojo/shared';
import { LessThan, Repository } from 'typeorm';
import { createSecretToken, parseSecretToken, secretMatches } from '../common/secret-token';
import type { AuthUser } from './auth-user';
import { RefreshTokenEntity } from './refresh-token.entity';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
/** Same as the old app's "auto login" cookie. */
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Access tokens are JWTs (stateless, checked on every request). Refresh tokens are random and
 * stored hashed, so they can be revoked per device and are rotated on every use.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokens: Repository<RefreshTokenEntity>,
  ) {}

  signAccessToken(user: AuthUser): string {
    return this.jwt.sign({ sub: user.id });
  }

  verifyAccessToken(token: string): AuthUser | null {
    try {
      const payload: unknown = this.jwt.verify(token);
      if (!isRecord(payload)) return null;
      const { sub } = payload;
      return typeof sub === 'string' ? { id: sub } : null;
    } catch {
      return null;
    }
  }

  async createRefreshToken(userId: string): Promise<string> {
    const created = createSecretToken();
    await this.refreshTokens.insert({
      id: created.id,
      userId,
      tokenHash: created.secretHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    return created.token;
  }

  /** Invalidates the token and issues a new one. Null if the token is unknown or expired. */
  async rotateRefreshToken(token: string): Promise<{ userId: string; token: string } | null> {
    const stored = await this.findValid(token);
    if (!stored) return null;
    await this.refreshTokens.delete(stored.id);
    await this.refreshTokens.delete({ userId: stored.userId, expiresAt: LessThan(new Date()) });
    return { userId: stored.userId, token: await this.createRefreshToken(stored.userId) };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const parsed = parseSecretToken(token);
    if (parsed) await this.refreshTokens.delete(parsed.id);
  }

  /** Logs the user out on every device, e.g. after a password change. */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokens.delete({ userId });
  }

  private async findValid(token: string): Promise<RefreshTokenEntity | null> {
    const parsed = parseSecretToken(token);
    if (!parsed) return null;
    const stored = await this.refreshTokens.findOneBy({ id: parsed.id });
    if (!stored || stored.expiresAt.getTime() <= Date.now()) return null;
    return secretMatches(parsed.secret, stored.tokenHash) ? stored : null;
  }
}
