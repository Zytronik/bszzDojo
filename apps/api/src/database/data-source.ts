import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { typeOrmOptions } from './typeorm-options';

// Entry point for the TypeORM CLI (npm run migration:*), which runs outside Nest.
if (existsSync('.env')) process.loadEnvFile('.env');

// pgbouncer (Neon's pooled URL) doesn't support everything migrations do.
// `||`, not `??`: .env.example leaves it empty.
const url = process.env['DATABASE_URL_UNPOOLED'] || process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');

export default new DataSource(typeOrmOptions(url));
