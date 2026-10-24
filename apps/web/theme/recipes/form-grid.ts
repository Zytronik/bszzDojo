import { defineRecipe } from '@pandacss/dev';

/**
 * Lays a form's fields out side by side, as many per row as fit (two on a phone). Buttons and
 * anything marked `data-full-width` take a whole row.
 */
export const formGrid = defineRecipe({
  className: 'form-grid',
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))',
    columnGap: '15',
    alignItems: 'start',
    '& > button, & > [data-full-width]': { gridColumn: '1 / -1' },
  },
});
