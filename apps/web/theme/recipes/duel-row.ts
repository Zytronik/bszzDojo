import { defineSlotRecipe } from '@pandacss/dev';

/** The parts of a duel row the `record` recipe doesn't have: outcome badge and score */
export const duelRow = defineSlotRecipe({
  className: 'duel-row',
  slots: ['icon', 'line', 'badge', 'score'],
  base: {
    icon: { color: 'accent.default' },
    // Plain inline text, so a long line wraps between words instead of moving the settings
    // under the outcome as a whole.
    line: { marginBlockStart: '5', textStyle: 'body.small' },
    // The outcome as text, like the accented figures of the rankings
    badge: {
      textStyle: 'body.small',
      layerStyle: 'muted',
      '&[data-tone=accent]': { color: 'accent.default', opacity: 'full' },
    },
    score: {
      fontWeight: 'bold',
      flexShrink: '0',
      whiteSpace: 'nowrap',
      '&[data-won]': { color: 'accent.default' },
    },
  },
});
