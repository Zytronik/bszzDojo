import { defineConfig } from 'tsup';

// CommonJS for NestJS, ESM for Angular.
export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  // Don't wipe dist on every rebuild in watch mode, or the other apps briefly lose it.
  clean: !options.watch,
}));
