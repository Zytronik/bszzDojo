import { defineSlotRecipe } from '@pandacss/dev';

/** The scorecard of a round entered on the target: ends as rows, arrows as buttons */
export const scoreSheet = defineSlotRecipe({
  className: 'score-sheet',
  slots: ['table', 'head', 'cell', 'shot', 'total'],
  base: {
    table: { w: 'full', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'center' },
    head: { textStyle: 'body.small', layerStyle: 'muted', fontWeight: 'normal', pb: '5' },
    cell: { p: '0', py: '5', layerStyle: 'divider' },
    shot: {
      layerStyle: 'surface',
      w: 'full',
      maxW: 'control',
      h: 'control',
      border: 'none',
      borderRadius: 'sm',
      cursor: 'pointer',
      transitionProperty: 'box-shadow',
      transitionDuration: 'normal',
      '&[aria-pressed=true]': {
        outlineWidth: 'thick',
        outlineStyle: 'solid',
        outlineColor: 'accent.default',
        // Inside the button, so the selected arrow keeps its size.
        outlineOffset: '-2px',
      },
    },
    total: { py: '5', layerStyle: 'divider', fontWeight: 'bold' },
  },
});
