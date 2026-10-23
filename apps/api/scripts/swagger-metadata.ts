/**
 * Writes `src/metadata.ts`: what the `@nestjs/swagger` CLI plugin (see `nest-cli.json`) knows
 * about the DTOs and controllers, i.e. their properties, validation rules and JSDoc comments.
 *
 * `nest build` applies the plugin itself, but Vercel bundles `src/main.ts` without the Nest CLI,
 * so the plugin never runs there. `main.ts` loads this file instead, which makes the Swagger docs
 * complete in both cases. Generated (and git-ignored), like Panda's `styled-system/`.
 */
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/plugin';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';

interface NestCliConfig {
  compilerOptions: { plugins: { name: string; options: Record<string, unknown> }[] };
}

const apiDir = join(__dirname, '..');
const sourceDir = join(apiDir, 'src');

// Same options as the build, so both produce the same docs.
const nestCli = JSON.parse(readFileSync(join(apiDir, 'nest-cli.json'), 'utf8')) as NestCliConfig;
const swaggerPlugin = nestCli.compilerOptions.plugins.find(
  (plugin) => plugin.name === '@nestjs/swagger',
);
if (!swaggerPlugin) throw new Error('nest-cli.json has no @nestjs/swagger plugin');

const config = ts.getParsedCommandLineOfConfigFile(join(apiDir, 'tsconfig.build.json'), undefined, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
    throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  },
});
if (!config) throw new Error('Could not read tsconfig.build.json');

// Passing our own program skips the Nest CLI's type check, which would fail on the first run:
// main.ts imports the file this script creates. `npm run typecheck` checks everything afterwards.
new PluginMetadataGenerator().generate({
  visitors: [new ReadonlyVisitor({ ...swaggerPlugin.options, pathToSource: sourceDir })],
  outputDir: sourceDir,
  filename: 'metadata.ts',
  tsProgramRef: ts.createProgram(config.fileNames, config.options),
});

// The generator loads each file with `await import("./x")` or `import("./x")`. Those need a `.js`
// extension under the API's `nodenext` resolution, and Vercel's bundler can't follow them, so
// they become static imports, which both `nest build` and Vercel's bundler handle like any other.
const outputFile = join(sourceDir, 'metadata.ts');
const generated = readFileSync(outputFile, 'utf8');
const paths = [
  ...new Set([...generated.matchAll(/import\("(\.\/[^"]+)"\)/g)].map((match) => match[1])),
];
const alias = (path: string | undefined): string => `m${paths.indexOf(path ?? '')}`;
const body = generated
  .replace(/await import\("(\.\/[^"]+)"\)/g, (_match, path: string) => alias(path))
  .replace(/import\("(\.\/[^"]+)"\)/g, (_match, path: string) => `Promise.resolve(${alias(path)})`);
const imports = paths.map((path) => `import * as ${alias(path)} from '${path}';`).join('\n');
writeFileSync(outputFile, `${imports}\n\n${body}`);
