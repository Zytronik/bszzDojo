import { defineSlotRecipe } from '@pandacss/dev';

/** The parts of a duel row the `record` recipe doesn't have: outcome badge and score */
export const duelRow = defineSlotRecipe({
  className: 'duel-row',
  slots: ['line', 'badge', 'score'],
  base: {
    line: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: '8',
      rowGap: '5',
      marginBlockStart: '5',
    },
    badge: {
      textStyle: 'body.small',
      fontWeight: 'bold',
      rounded: 'sm',
      px: '8',
      py: '5',
      layerStyle: 'surface',
      // A win, or the viewer's turn
      '&[data-tone=accent]': { bg: 'accent.default', color: 'fg.onAccent' },
    },
    score: {
      fontSize: 'lg',
      fontWeight: 'bold',
      flexShrink: '0',
      whiteSpace: 'nowrap',
      '&[data-won]': { color: 'accent.default' },
    },
  },
});
