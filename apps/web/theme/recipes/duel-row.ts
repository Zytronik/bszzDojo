import { defineSlotRecipe } from '@pandacss/dev';

/** The parts of a duel row the `record` recipe doesn't have: state and score */
export const duelRow = defineSlotRecipe({
  className: 'duel-row',
  slots: ['icon', 'line', 'badge', 'score'],
  base: {
    icon: { color: 'accent.default' },
    // Plain inline text, so a long line wraps between words instead of moving the settings
    // under the outcome as a whole.
    // Body size like the info line of the other records
    line: { marginBlockStart: '5' },
    // An open duel's state, accented when it's the viewer's turn
    badge: { '&[data-tone=accent]': { color: 'accent.default' } },
    score: {
      fontWeight: 'bold',
      flexShrink: '0',
      whiteSpace: 'nowrap',
      '&[data-won]': { color: 'accent.default' },
    },
  },
});
