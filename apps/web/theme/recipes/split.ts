import { defineRecipe } from '@pandacss/dev';

/** Two blocks side by side from `md`, stacked on a phone: the target and what goes with it. */
export const split = defineRecipe({
  className: 'split',
  base: {
    display: 'flex',
    flexDir: 'column',
    gap: '25',
    md: { display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'start' },
  },
});
