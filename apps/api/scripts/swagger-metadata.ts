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

// The generator writes `await import("./x")` and `import("./x")`. The API compiles to CommonJS with `nodenext`
// resolution, where such an import would need a `.js` extension, which only exists after
// compiling; Vercel runs main.ts straight from TypeScript. `require` resolves in both cases.
const outputFile = join(sourceDir, 'metadata.ts');
writeFileSync(
  outputFile,
  readFileSync(outputFile, 'utf8')
    .replace(/await import\("(\.\/[^"]+)"\)/g, 'require("$1")')
    .replace(/import\("(\.\/[^"]+)"\)/g, 'Promise.resolve(require("$1"))'),
);
