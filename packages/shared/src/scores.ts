import { isBowTypeId, type BowTypeId } from './bow-types';
import { isValidIsoDate, todayInClub, type IsoDate } from './dates';
import { isInteger } from './guards';

/** Target face diameters in cm. */
export const TARGET_SIZES = [122, 80, 60, 40] as const;
export type TargetSize = (typeof TARGET_SIZES)[number];

export const MAX_DISTANCE = 90;
export const MAX_ARROWS = 300;
export const POINTS_PER_ARROW = 10;
export const EARLIEST_SCORE_DATE: IsoDate = '2000-01-01';

export function isTargetSize(value: unknown): value is TargetSize {
  return typeof value === 'number' && (TARGET_SIZES as readonly number[]).includes(value);
}

/** Body of `POST /api/scores` */
export interface ScoreInput {
  bowType: BowTypeId;
  targetSize: TargetSize;
  /** Spot face (only the inner rings) instead of the full face. */
  isSpot: boolean;
  /** The day it was shot. */
  shotOn: IsoDate;
  /** Meters */
  distance: number;
  arrows: number;
  /** Number of arrows in the 10 ring */
  tens: number;
  /** Number of arrows in the 9 ring */
  nines: number;
  /** Total points */
  result: number;
}

export interface Score extends ScoreInput {
  id: string;
}

export interface RankedScore extends Score {
  /** 1-based place within its group */
  rank: number;
}

/**
 * German messages for everything wrong with a score, empty if it's valid. Shared so the form shows
 * the same errors the API would answer with.
 */
export function scoreErrors(score: ScoreInput, today: IsoDate = todayInClub()): string[] {
  const errors: string[] = [];
  const { arrows, tens, nines, result, distance } = score;

  if (!isBowTypeId(score.bowType)) errors.push('Ungültige Bogenart.');
  if (!isTargetSize(score.targetSize)) errors.push('Ungültige Scheibengrösse.');
  if (!isValidIsoDate(score.shotOn)) {
    errors.push('Ungültiges Datum.');
  } else if (score.shotOn > today) {
    errors.push('Das Datum darf nicht in der Zukunft liegen.');
  } else if (score.shotOn < EARLIEST_SCORE_DATE) {
    errors.push('Das Datum ist zu weit in der Vergangenheit.');
  }
  if (!isInteger(distance) || distance < 1 || distance > MAX_DISTANCE) {
    errors.push(`Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`);
  }
  if (!isInteger(arrows) || arrows < 1 || arrows > MAX_ARROWS) {
    errors.push(`Die Anzahl Pfeile muss zwischen 1 und ${MAX_ARROWS} liegen.`);
  }
  if (!isInteger(tens) || tens < 0 || !isInteger(nines) || nines < 0) {
    errors.push('10er und 9er dürfen nicht negativ sein.');
  } else if (isInteger(arrows) && tens + nines > arrows) {
    errors.push('Es gibt mehr 10er und 9er als Pfeile.');
  }
  if (!isInteger(result) || result < 0) {
    errors.push('Das Resultat darf nicht negativ sein.');
  } else if (isInteger(arrows) && result > arrows * POINTS_PER_ARROW) {
    errors.push(`Mit ${arrows} Pfeilen sind höchstens ${arrows * POINTS_PER_ARROW} Punkte möglich.`);
  } else if (isInteger(tens) && isInteger(nines) && result < tens * 10 + nines * 9) {
    errors.push('Das Resultat ist kleiner als die Punkte der 10er und 9er.');
  }
  return errors;
}

/** "40cm Spot" */
export function targetLabel(score: Pick<ScoreInput, 'targetSize' | 'isSpot'>): string {
  return `${score.targetSize}cm${score.isSpot ? ' Spot' : ''}`;
}
