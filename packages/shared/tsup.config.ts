import { defineConfig } from 'tsup';

// Builds both CommonJS (consumed by NestJS) and ESM (consumed by Angular).
export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  // Don't wipe dist on every rebuild in watch mode, or the other apps briefly lose it.
  clean: !options.watch,
}));
