import { isOneOf } from './guards';

export const BOW_TYPE_IDS = ['r', 'cp', 'tr', 'lb', 'bb'] as const;
export type BowTypeId = (typeof BOW_TYPE_IDS)[number];

export interface BowType {
  name: string;
  /**
   * Handicap for the leaderboards, in percent of the raw result. Integer percent instead of a
   * float factor so `adjustedResult` is exact (300 × 1.18 is 353.99999… in floating point).
   */
  factorPercent: number;
  chartColor: string;
}

export const BOW_TYPES: Record<BowTypeId, BowType> = {
  r: { name: 'Recurve', factorPercent: 102, chartColor: 'rgb(250, 199, 16)' },
  cp: { name: 'Compound', factorPercent: 100, chartColor: 'rgb(228, 56, 17)' },
  tr: { name: 'Traditionell', factorPercent: 118, chartColor: 'rgb(29, 179, 157)' },
  lb: { name: 'Langbogen', factorPercent: 120, chartColor: 'rgb(14, 122, 88)' },
  bb: { name: 'Barebow', factorPercent: 112, chartColor: 'rgb(160, 0, 24)' },
};

/** For selects, in the order of `BOW_TYPE_IDS` */
export const BOW_TYPE_OPTIONS = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));

export function isBowTypeId(value: unknown): value is BowTypeId {
  return isOneOf(BOW_TYPE_IDS, value);
}

export function adjustedResult(result: number, bowType: BowTypeId): number {
  return Math.floor((result * BOW_TYPES[bowType].factorPercent) / 100);
}
