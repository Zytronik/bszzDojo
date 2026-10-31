import { defineSlotRecipe } from '@pandacss/dev';

/** The parts of a duel row the `record` recipe doesn't have: state and score */
export const duelRow = defineSlotRecipe({
  className: 'duel-row',
  slots: ['icon', 'line', 'state', 'format', 'score'],
  base: {
    icon: { color: 'accent.default' },
    // Like the rankings' details (`record.meta`): small and muted
    line: { marginBlockStart: '5', textStyle: 'body.small', layerStyle: 'muted' },
    // An open duel's state, accented when it's the viewer's turn
    state: { '&[data-tone=accent]': { color: 'accent.default', opacity: 'full' } },
    // The format stands out like the rankings' accented figures
    format: { color: 'accent.default', opacity: 'full' },
    score: {
      fontWeight: 'bold',
      flexShrink: '0',
      whiteSpace: 'nowrap',
      '&[data-won]': { color: 'accent.default' },
    },
  },
});
