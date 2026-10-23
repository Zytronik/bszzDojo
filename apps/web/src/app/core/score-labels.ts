import { BOW_TYPES, formatGermanDate, targetLabel, type BowTypeId, type IsoDate, type ScoreInput } from '@bszz-dojo/shared';

export function bowTypeName(bowType: BowTypeId): string {
  return BOW_TYPES[bowType].name;
}

export function formatDate(value: IsoDate | string): string {
  return formatGermanDate(value);
}

/** "40cm Spot" */
export function targetText(score: Pick<ScoreInput, 'targetSize' | 'isSpot'>): string {
  return targetLabel(score);
}
