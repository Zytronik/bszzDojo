import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { RefreshTokenEntity } from '../auth/refresh-token.entity';
import { BadgeEntity } from '../badges/badge.entity';
import { DuelEndEntity } from '../duels/duel-end.entity';
import { DuelEntity } from '../duels/duel.entity';
import { ScoreEntity } from '../scores/score.entity';
import { UserEntity } from '../users/user.entity';

const ENTITIES = [
  UserEntity,
  RefreshTokenEntity,
  ScoreEntity,
  BadgeEntity,
  DuelEntity,
  DuelEndEntity,
];

/**
 * Entities are listed, not globbed, so Vercel's bundler sees them. SSL comes from the connection
 * string (`?sslmode=require` on Neon), so a local Postgres works without it.
 */
export function typeOrmOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: ENTITIES,
    // .ts when the CLI runs through ts-node, .js in the build.
    migrations: [join(__dirname, 'migrations', __filename.endsWith('.ts') ? '*.ts' : '*.js')],
    synchronize: false,
  };
}
