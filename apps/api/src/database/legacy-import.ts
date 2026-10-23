/**
 * One-off copy of the old PHP app's MySQL data into Postgres:
 *
 *   npm run legacy:import -w api
 *
 * Reads `LEGACY_MYSQL_URL` and `DATABASE_URL_UNPOOLED` / `DATABASE_URL` from `apps/api/.env`, runs
 * pending migrations and copies users, scores, badges and badge requests. It refuses to run if the
 * Postgres database already has users, so it can't import twice. Passwords keep working: the old
 * bcrypt hashes are copied. Emails, open password reset links and "auto login" cookies are not
 * copied. Usernames with characters that aren't allowed any more (spaces, umlauts) get them
 * replaced by `_` and keep their old spelling as display name; the warnings list who logs in how.
 */
import {
  DEFAULT_USER_SETTINGS,
  DISPLAY_NAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  isValidUsername,
  isBadgePlace,
  isBowTypeId,
  isRankId,
  isRecord,
  isTargetSize,
  normalizeDisplayName,
  usernameKey,
  type BadgePlace,
  type TargetSize,
} from '@bszz-dojo/shared';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createConnection, type RowDataPacket } from 'mysql2/promise';
import { DataSource, type EntityManager } from 'typeorm';
import { compatibleHash } from '../auth/auth.service';
import { BadgeRequestEntity } from '../badges/badge-request.entity';
import { BadgeEntity } from '../badges/badge.entity';
import { ScoreEntity } from '../scores/score.entity';
import { UserEntity } from '../users/user.entity';
import { typeOrmOptions } from './typeorm-options';

interface LegacyUser extends RowDataPacket {
  id: number;
  username: string;
  passwordHash: string;
  role: string | null;
  rank: string | null;
  badges: string | null;
  createdAt: string | null;
}

interface LegacyScore extends RowDataPacket {
  id: number;
  userId: number;
  bowType: string;
  targetSize: number;
  distance: number;
  isSpot: number;
  tens: number;
  nines: number;
  result: number;
  numberOfArrows: number;
  createdAt: string;
}

interface LegacyRequest extends RowDataPacket {
  id: number;
  userId: number;
  name: string;
  rank: number | string;
  createdAt: string | null;
}

interface LegacyBadge {
  name: string;
  year: number;
  place: BadgePlace;
}

const warnings: string[] = [];
function warn(message: string): void {
  warnings.push(message);
  console.warn(`! ${message}`);
}

/** MySQL `DATETIME` / `DATE` as returned with `dateStrings: true`. */
function toDate(value: string | null): Date {
  if (!value) return new Date();
  return new Date(value.includes(' ') ? `${value.replace(' ', 'T')}Z` : `${value}T00:00:00Z`);
}

function toIsoDay(value: string): string {
  return value.slice(0, 10);
}

/**
 * `badges` was a JSON array of `{ badgeName, year, rank }`; the old "remove badge" re-encoded the
 * remaining entries as JSON strings, so both forms occur.
 */
function parseBadges(raw: string | null, username: string): LegacyBadge[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    warn(`${username}: unreadable badges JSON, skipped: ${raw}`);
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const badges: LegacyBadge[] = [];
  for (const item of parsed as unknown[]) {
    let entry: unknown = item;
    if (typeof item === 'string') {
      try {
        entry = JSON.parse(item);
      } catch {
        entry = null;
      }
    }
    if (!isRecord(entry)) {
      warn(`${username}: unreadable badge, skipped: ${JSON.stringify(item)}`);
      continue;
    }
    const name = typeof entry['badgeName'] === 'string' ? entry['badgeName'].trim() : '';
    const year = Number(entry['year']);
    const place = Number(entry['rank']);
    if (!name || !Number.isInteger(year) || !isBadgePlace(place)) {
      warn(`${username}: incomplete badge, skipped: ${JSON.stringify(entry)}`);
      continue;
    }
    badges.push({ name, year, place });
  }
  return badges;
}

/** A valid username from an old one: disallowed characters become `_`. */
function legacyUsername(original: string, legacyId: number): string {
  const username = original
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, USERNAME_MAX_LENGTH);
  return isValidUsername(username) && username.length >= USERNAME_MIN_LENGTH
    ? username
    : `user_${legacyId}`;
}

async function copyUsers(
  manager: EntityManager,
  users: LegacyUser[],
): Promise<Map<number, string>> {
  const ids = new Map<number, string>();
  const takenKeys = new Set<string>();

  for (const legacy of users) {
    const original = normalizeDisplayName(legacy.username) ?? `user${legacy.id}`;
    let username = legacyUsername(original, legacy.id);
    let key = usernameKey(username);
    if (takenKeys.has(key)) {
      const renamed = `${username.slice(0, USERNAME_MAX_LENGTH - 6)}_${legacy.id}`;
      warn(
        `username "${username}" exists twice ignoring case; user ${legacy.id} is now "${renamed}"`,
      );
      username = renamed;
      key = usernameKey(renamed);
    }
    takenKeys.add(key);
    // The old spelling (with spaces, umlauts, …) stays visible as the display name.
    const displayName = original === username ? null : original.slice(0, DISPLAY_NAME_MAX_LENGTH);
    if (displayName !== null) warn(`"${original}" logs in as "${username}" now`);

    const rank = legacy.rank && isRankId(legacy.rank) ? legacy.rank : null;
    if (legacy.rank && rank === null) warn(`${username}: unknown rank "${legacy.rank}" dropped`);

    const id = randomUUID();
    ids.set(legacy.id, id);
    const createdAt = toDate(legacy.createdAt);
    await manager.insert(UserEntity, {
      id,
      username,
      usernameKey: key,
      displayName,
      passwordHash: compatibleHash(legacy.passwordHash),
      role: legacy.role === 'admin' ? 'admin' : 'user',
      rank,
      settings: DEFAULT_USER_SETTINGS,
      createdAt,
      updatedAt: createdAt,
    });

    for (const badge of parseBadges(legacy.badges, username)) {
      await manager.insert(BadgeEntity, { id: randomUUID(), userId: id, ...badge });
    }
  }
  return ids;
}

async function copyScores(
  manager: EntityManager,
  scores: LegacyScore[],
  userIds: Map<number, string>,
): Promise<number> {
  let copied = 0;
  for (const legacy of scores) {
    const userId = userIds.get(legacy.userId);
    if (!userId) {
      warn(`score ${legacy.id}: user ${legacy.userId} doesn't exist, skipped`);
      continue;
    }
    if (!isBowTypeId(legacy.bowType) || legacy.numberOfArrows < 1) {
      warn(
        `score ${legacy.id}: bow type "${legacy.bowType}" or ${legacy.numberOfArrows} arrows invalid, skipped`,
      );
      continue;
    }
    const targetSize = Number(legacy.targetSize);
    if (!isTargetSize(targetSize))
      warn(`score ${legacy.id}: unusual target size ${targetSize}cm, kept`);
    await manager.insert(ScoreEntity, {
      id: randomUUID(),
      userId,
      bowType: legacy.bowType,
      // Kept even if it's not one of today's sizes; the column is a plain smallint.
      targetSize: targetSize as TargetSize,
      isSpot: Boolean(Number(legacy.isSpot)),
      distance: Number(legacy.distance),
      arrows: Number(legacy.numberOfArrows),
      tens: Number(legacy.tens),
      nines: Number(legacy.nines),
      result: Number(legacy.result),
      shotOn: toIsoDay(legacy.createdAt),
      // Rounds of one day keep the order they were entered in.
      createdAt: new Date(toDate(legacy.createdAt).getTime() + legacy.id),
    });
    copied += 1;
  }
  return copied;
}

async function copyRequests(
  manager: EntityManager,
  requests: LegacyRequest[],
  userIds: Map<number, string>,
): Promise<number> {
  let copied = 0;
  for (const legacy of requests) {
    const userId = userIds.get(legacy.userId);
    const place = Number(legacy.rank);
    if (!userId || !isBadgePlace(place)) {
      warn(`badge request ${legacy.id}: unknown user or place "${legacy.rank}", skipped`);
      continue;
    }
    await manager.insert(BadgeRequestEntity, {
      id: randomUUID(),
      userId,
      name: legacy.name.trim(),
      place,
      createdAt: toDate(legacy.createdAt),
    });
    copied += 1;
  }
  return copied;
}

async function main(): Promise<void> {
  if (existsSync('.env')) process.loadEnvFile('.env');
  const mysqlUrl = process.env['LEGACY_MYSQL_URL'];
  const postgresUrl = process.env['DATABASE_URL_UNPOOLED'] || process.env['DATABASE_URL'];
  if (!mysqlUrl || !postgresUrl) throw new Error('LEGACY_MYSQL_URL and DATABASE_URL must be set');

  const mysql = await createConnection({ uri: mysqlUrl, dateStrings: true });
  const postgres = await new DataSource(typeOrmOptions(postgresUrl)).initialize();
  try {
    await postgres.runMigrations();
    if ((await postgres.getRepository(UserEntity).count()) > 0) {
      throw new Error('The Postgres database already has users; import only into an empty one.');
    }

    const [users] = await mysql.query<LegacyUser[]>('SELECT * FROM `user` ORDER BY id');
    const [scores] = await mysql.query<LegacyScore[]>('SELECT * FROM `score` ORDER BY id');
    const [requests] = await mysql.query<LegacyRequest[]>('SELECT * FROM `request` ORDER BY id');

    await postgres.transaction(async (manager) => {
      const userIds = await copyUsers(manager, users);
      const copiedScores = await copyScores(manager, scores, userIds);
      const copiedRequests = await copyRequests(manager, requests, userIds);
      console.log(
        `Copied ${userIds.size} users, ${copiedScores}/${scores.length} scores, ` +
          `${copiedRequests}/${requests.length} badge requests.`,
      );
    });
    console.log(
      warnings.length === 0 ? 'No warnings.' : `${warnings.length} warning(s), see above.`,
    );
  } finally {
    await mysql.end();
    await postgres.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
