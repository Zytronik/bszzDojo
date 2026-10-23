import { defineRecipe } from '@pandacss/dev';

/** A medal count with a colored dot after it, in the medal leaderboard */
export const medal = defineRecipe({
  className: 'medal',
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '5',
    color: 'accent.default',
    _after: {
      content: '""',
      display: 'block',
      width: 'dot',
      height: 'dot',
      borderRadius: 'full',
    },
  },
  variants: {
    tier: {
      gold: { _after: { bg: 'medal.gold' } },
      silver: { _after: { bg: 'medal.silver' } },
      bronze: { _after: { bg: 'medal.bronze' } },
    },
  },
});
