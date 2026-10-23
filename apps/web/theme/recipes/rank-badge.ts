import { defineRecipe } from '@pandacss/dev';

/** A club badge ("Abzeichen"): its icon on its color. Variant names are the shared `RankId`s. */
export const rankBadge = defineRecipe({
  className: 'rank-badge',
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'rankBadge',
    py: '5',
    px: '10',
    borderRadius: 'md',
    '& img': { height: 'full', width: 'auto', objectFit: 'contain' },
  },
  variants: {
    rank: {
      roteFeder: { bg: 'rank.red' },
      goldeneFeder: { bg: 'rank.gold' },
      weisserPfeil: { bg: 'rank.white' },
      blauerPfeil: { bg: 'rank.blue' },
      roterPfeil: { bg: 'rank.red' },
      goldenerPfeil: { bg: 'rank.gold' },
    },
  },
});
