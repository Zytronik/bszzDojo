import { defineSlotRecipe } from '@pandacss/dev';

/** A label above its input, one per form row, with a hint or the input's error below it */
export const field = defineSlotRecipe({
  className: 'field',
  slots: ['root', 'label', 'hint', 'error'],
  base: {
    root: { display: 'flex', flexDirection: 'column', mb: 'stack' },
    label: { mb: '5' },
    hint: { textStyle: 'body.small', layerStyle: 'muted', mt: '5' },
    error: { textStyle: 'body.small', color: 'status.error.fg', mt: '5', animation: 'fadeIn' },
  },
});
