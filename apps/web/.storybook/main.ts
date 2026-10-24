import type { StorybookConfig } from '@storybook/angular-vite';
import pandacss from '@pandacss/dev/postcss';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  // Only inputs and outputs in the docs' tables, not the components' internals
  framework: { name: '@storybook/angular-vite', options: { propsTable: 'inputs' } },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  // The logo, rank icons and the Avenir font
  staticDirs: ['../public'],
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(viteConfig, {
      resolve: {
        alias: { 'styled-system': fileURLToPath(new URL('../styled-system', import.meta.url)) },
      },
      css: { postcss: { plugins: [pandacss()] } },
      // Not pre-bundled, so a rebuilt shared package is picked up without clearing Vite's cache.
      optimizeDeps: { exclude: ['@bszz-dojo/shared'] },
    });
  },
};

export default config;
