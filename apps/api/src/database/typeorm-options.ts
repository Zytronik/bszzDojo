import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { RefreshTokenEntity } from '../auth/refresh-token.entity';
import { BadgeRequestEntity } from '../badges/badge-request.entity';
import { BadgeEntity } from '../badges/badge.entity';
import { ScoreEntity } from '../scores/score.entity';
import { UserEntity } from '../users/user.entity';

export const ENTITIES = [
  UserEntity,
  RefreshTokenEntity,
  ScoreEntity,
  BadgeEntity,
  BadgeRequestEntity,
];

/**
 * Shared by the Nest app and the TypeORM CLI. Entities are listed, not globbed, so Vercel's
 * bundler sees them. SSL is configured through the connection string (`?sslmode=require` on
 * Neon), so a local Postgres works without it.
 */
export function typeOrmOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: ENTITIES,
    // .ts when the CLI runs through ts-node; .js in the build (which also has .d.ts files).
    migrations: [join(__dirname, 'migrations', __filename.endsWith('.ts') ? '*.ts' : '*.js')],
    synchronize: false,
  };
}
