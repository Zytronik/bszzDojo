import { defineRecipe } from '@pandacss/dev';

/** Two fields next to each other; everything else in a form takes the full width. */
export const formRow = defineRecipe({
  className: 'form-row',
  base: { display: 'grid', columnGap: '15', alignItems: 'start' },
  variants: {
    split: {
      even: { gridTemplateColumns: '1fr 1fr' },
      /** 60/40, e.g. a select and a checkbox */
      wide: { gridTemplateColumns: '3fr 2fr' },
    },
  },
  defaultVariants: { split: 'even' },
});
