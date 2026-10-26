import { defineRecipe } from '@pandacss/dev';

/** A raised block of content on the page: a figure, a fact, a summary. */
export const card = defineRecipe({
  className: 'card',
  base: { layerStyle: 'surface', rounded: 'sm' },
  variants: {
    size: {
      sm: { p: '10' },
      md: { p: '15' },
    },
  },
  defaultVariants: { size: 'sm' },
});
