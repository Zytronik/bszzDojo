import { defineSlotRecipe } from '@pandacss/dev';

/** A label above its input, one per form row */
export const field = defineSlotRecipe({
  className: 'field',
  slots: ['root', 'label', 'hint'],
  base: {
    root: { display: 'flex', flexDirection: 'column', mb: 'stack' },
    label: { mb: '5' },
    hint: { textStyle: 'body.small', layerStyle: 'muted', mt: '5' },
  },
});
