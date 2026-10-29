import { defineSlotRecipe } from '@pandacss/dev';

/** The parts of a duel row the `record` recipe doesn't have: outcome badge and score */
export const duelRow = defineSlotRecipe({
  className: 'duel-row',
  slots: ['icon', 'line', 'badge', 'score'],
  base: {
    icon: { marginInlineEnd: '5', color: 'accent.default' },
    line: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      columnGap: '8',
      marginBlockStart: '5',
    },
    badge: {
      textStyle: 'body.small',
      lineHeight: 'snug',
      rounded: 'sm',
      px: '5',
      layerStyle: 'surface',
      // A win, or the viewer's turn
      '&[data-tone=accent]': { bg: 'accent.default', color: 'fg.onAccent' },
    },
    score: {
      fontWeight: 'bold',
      flexShrink: '0',
      whiteSpace: 'nowrap',
      '&[data-won]': { color: 'accent.default' },
    },
  },
});
