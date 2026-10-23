/** Club badges ("Abzeichen"); every user picks their own in the settings, at most one. */
export const RANK_IDS = [
  'roteFeder',
  'goldeneFeder',
  'weisserPfeil',
  'blauerPfeil',
  'roterPfeil',
  'goldenerPfeil',
] as const;
export type RankId = (typeof RANK_IDS)[number];

export interface Rank {
  name: string;
  /** Image in `public/img/ranks/`, drawn on the rank's color. */
  icon: 'feather' | 'arrow';
}

export const RANKS: Record<RankId, Rank> = {
  roteFeder: { name: 'rote Feder', icon: 'feather' },
  goldeneFeder: { name: 'goldene Feder', icon: 'feather' },
  weisserPfeil: { name: 'weisser Pfeil', icon: 'arrow' },
  blauerPfeil: { name: 'blauer Pfeil', icon: 'arrow' },
  roterPfeil: { name: 'roter Pfeil', icon: 'arrow' },
  goldenerPfeil: { name: 'goldener Pfeil', icon: 'arrow' },
};

export function isRankId(value: unknown): value is RankId {
  return typeof value === 'string' && (RANK_IDS as readonly string[]).includes(value);
}
