import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  APP_NAME,
  DEFAULT_USER_SETTINGS,
  normalizeEmail,
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
import { createSecretToken, parseSecretToken, secretMatches } from '../common/secret-token';
import { MailService } from '../mail/mail.service';
import { toUserProfile } from '../users/user-profile';
import { UserEntity } from '../users/user.entity';
import { PasswordResetEntity } from './password-reset.entity';
import { TokenService } from './token.service';

export const BCRYPT_ROUNDS = 10;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
/** Compared against when the username doesn't exist, so both cases take as long. */
const DUMMY_PASSWORD_HASH = hashSync('not-a-real-password', BCRYPT_ROUNDS);

export const USERNAME_TAKEN = 'Benutzername ist bereits vergeben.';
export const EMAIL_TAKEN = 'E-Mail wird bereits verwendet.';

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

/** Throws a 409 with a German message if the write hit the username or email index. */
export function rethrowUniqueViolation(error: unknown): never {
  const constraint = uniqueViolation(error);
  if (constraint === 'UQ_users_username_key') throw new ConflictException(USERNAME_TAKEN);
  if (constraint === 'UQ_users_email') throw new ConflictException(EMAIL_TAKEN);
  throw error;
}

/** A session plus the refresh token, which the controller puts in a cookie. */
export interface IssuedSession {
  session: AuthSession;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(PasswordResetEntity)
    private readonly passwordResets: Repository<PasswordResetEntity>,
    private readonly tokens: TokenService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async register({ username, email, password }: RegisterRequest): Promise<IssuedSession> {
    const user = this.users.create({
      id: randomUUID(),
      username: normalizeUsername(username),
      usernameKey: usernameKey(username),
      email: normalizeEmail(email),
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

  /** Answers the same whether or not the address exists, so it can't be used to probe accounts. */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findOneBy({ email: normalizeEmail(email) });
    if (!user) return;

    // Only the newest link works.
    await this.passwordResets.delete({ userId: user.id });
    const created = createSecretToken();
    await this.passwordResets.insert({
      id: created.id,
      userId: user.id,
      tokenHash: created.secretHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    });

    const appUrl = this.appUrl();
    const link = `${appUrl}/reset-password?token=${encodeURIComponent(created.token)}`;
    try {
      await this.mail.send({
        to: user.email,
        subject: `Passwort zurücksetzen | ${APP_NAME}`,
        text: [
          `Hallo ${user.username},`,
          '',
          'Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.',
          'Klicke auf den folgenden Link, um dein Passwort zurückzusetzen (gültig für eine Stunde):',
          link,
          '',
          'Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.',
          '',
          'Freundliche Grüsse,',
          `Dein ${APP_NAME} Team`,
        ].join('\n'),
      });
    } catch (error: unknown) {
      // Logged, not returned: the response must not reveal that the address exists.
      this.logger.error(`Password reset mail to ${user.email} failed`, error);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const parsed = parseSecretToken(token);
    const reset = parsed && (await this.passwordResets.findOneBy({ id: parsed.id }));
    const valid =
      parsed !== null &&
      reset !== null &&
      reset.expiresAt.getTime() > Date.now() &&
      secretMatches(parsed.secret, reset.tokenHash);
    if (!valid) throw new UnauthorizedException('Der Link ist ungültig oder abgelaufen.');

    await this.users.update(reset.userId, { passwordHash: await hashPassword(password) });
    await this.passwordResets.delete({ userId: reset.userId });
    await this.tokens.revokeAllRefreshTokens(reset.userId);
  }

  /**
   * Where reset links point. `APP_URL` in production; preview deployments fall back to their own
   * URL, which Vercel sets, since web and API share it.
   */
  private appUrl(): string {
    const configured = this.config.get<string>('APP_URL');
    if (configured) return configured.replace(/\/$/, '');
    const vercelUrl = this.config.get<string>('VERCEL_BRANCH_URL') ?? this.config.get<string>('VERCEL_URL');
    return vercelUrl ? `https://${vercelUrl}` : 'http://localhost:4200';
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
