import { defineConfig } from '@pandacss/dev';
import { globalCss } from './theme/global-css';
import { layerStyles } from './theme/layer-styles';
import { recipes, slotRecipes } from './theme/recipes';
import { semanticTokens } from './theme/semantic-tokens';
import { textStyles } from './theme/text-styles';
import { tokens } from './theme/tokens';

export default defineConfig({
  preflight: true,
  // Templates can't call `css()`, so styles live in the components' .ts files.
  include: ['./src/**/*.ts'],
  exclude: ['./src/**/*.spec.ts'],
  outdir: 'styled-system',
  // .js instead of .mjs, which esbuild and TypeScript both resolve without extra config.
  outExtension: 'js',
  // Utilities, patterns and conditions only: every token is ours (`theme/`), none from Panda's preset.
  presets: ['@pandacss/preset-base'],
  conditions: {
    extend: {
      light: '[data-theme=light] &',
    },
  },
  globalFontface: {
    Avenir: {
      src: 'url(/fonts/avenir/avenir_roman_12.woff) format("woff")',
      fontDisplay: 'swap',
    },
  },
  globalCss,
  theme: {
    // Bootstrap 3's, so the layout breaks where the old one did.
    breakpoints: {
      sm: '768px',
      md: '992px',
      lg: '1200px',
    },
    tokens,
    semanticTokens,
    textStyles,
    layerStyles,
    recipes,
    slotRecipes,
    keyframes: {
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
      },
      spin: {
        to: { transform: 'rotate(360deg)' },
      },
    },
  },
  // Recipes are called from TypeScript with variants that are often dynamic (a rank, a status),
  // which static extraction can't see, so all variants are generated.
  staticCss: {
    recipes: '*',
  },
});
