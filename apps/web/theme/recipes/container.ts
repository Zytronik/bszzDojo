import { defineRecipe } from '@pandacss/dev';

/** The centered column every page section and the header sit in (Bootstrap 3 widths). */
export const pageContainer = defineRecipe({
  className: 'page-container',
  base: {
    width: 'full',
    mx: 'auto',
    px: 'gutter',
    sm: { maxWidth: 'container.sm' },
    md: { maxWidth: 'container.md' },
    lg: { maxWidth: 'container.lg' },
  },
});
