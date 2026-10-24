import { isBowTypeId, type BowTypeId } from './bow-types';
import { isValidIsoDate, todayInClub, type IsoDate } from './dates';
import { isInteger } from './guards';
import { ARROWS_PER_END, isShot, shotTotals, type Shot } from './target';

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
  tens: number;
  nines: number;
  result: number;
  /**
   * Every arrow's position when the round was entered on the target, in the order shot; `null`
   * when only the totals were entered. Then `result`, `tens` and `nines` follow from them.
   */
  shots: Shot[] | null;
}

export interface Score extends ScoreInput {
  id: string;
}

export interface RankedScore extends Score {
  /** 1-based place within its group */
  rank: number;
}

/** On the target, a slot stays `null` until its arrow is placed. */
export type ScoreDraft = {
  [K in Exclude<keyof ScoreInput, 'shots'>]: ScoreInput[K] | null;
} & { shots: (Shot | null)[] | null };

export type ScoreFieldErrors = Partial<Record<keyof ScoreInput, string>>;

/**
 * Empty fields get no message here (the form says they're required). Cross-field rules go on the
 * field that's usually entered last: more tens and nines than arrows goes on `arrows`.
 */
export function scoreFieldErrors(
  score: ScoreDraft,
  today: IsoDate = todayInClub(),
): ScoreFieldErrors {
  const errors: ScoreFieldErrors = {};
  const { arrows, tens, nines, result, distance, shotOn } = score;

  if (!isBowTypeId(score.bowType)) errors.bowType = 'Ungültige Bogenart.';
  if (!isTargetSize(score.targetSize)) errors.targetSize = 'Ungültige Scheibengrösse.';
  if (typeof shotOn !== 'string' || !isValidIsoDate(shotOn)) {
    errors.shotOn = 'Ungültiges Datum.';
  } else if (shotOn > today) {
    errors.shotOn = 'Das Datum darf nicht in der Zukunft liegen.';
  } else if (shotOn < EARLIEST_SCORE_DATE) {
    errors.shotOn = 'Das Datum ist zu weit in der Vergangenheit.';
  }
  if (distance !== null && (!isInteger(distance) || distance < 1 || distance > MAX_DISTANCE)) {
    errors.distance = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;
  }
  if (tens !== null && (!isInteger(tens) || tens < 0)) {
    errors.tens = 'Die Anzahl 10er darf nicht negativ sein.';
  }
  if (nines !== null && (!isInteger(nines) || nines < 0)) {
    errors.nines = 'Die Anzahl 9er darf nicht negativ sein.';
  }
  if (arrows !== null) {
    if (!isInteger(arrows) || arrows < 1 || arrows > MAX_ARROWS) {
      errors.arrows = `Die Anzahl Pfeile muss zwischen 1 und ${MAX_ARROWS} liegen.`;
    } else if (isInteger(tens) && isInteger(nines) && tens + nines > arrows) {
      errors.arrows = 'Es gibt mehr 10er und 9er als Pfeile.';
    }
  }
  if (result !== null) {
    if (!isInteger(result) || result < 0) {
      errors.result = 'Das Resultat darf nicht negativ sein.';
    } else if (isInteger(arrows) && arrows > 0 && result > arrows * POINTS_PER_ARROW) {
      errors.result = `Mit ${arrows} Pfeilen sind höchstens ${arrows * POINTS_PER_ARROW} Punkte möglich.`;
    } else if (isInteger(tens) && isInteger(nines) && result < tens * 10 + nines * 9) {
      errors.result = 'Das Resultat ist kleiner als die Punkte der 10er und 9er.';
    }
  }
  if (score.shots !== null) {
    if (isInteger(arrows) && arrows % ARROWS_PER_END !== 0) {
      errors.arrows ??= `Die Anzahl Pfeile muss durch ${ARROWS_PER_END} teilbar sein.`;
    }
    if (!isComplete(score.shots, arrows)) {
      errors.shots = score.shots.every((shot) => shot === null || isShot(shot))
        ? 'Setze alle Pfeile auf der Scheibe.'
        : 'Ungültige Pfeilposition.';
    } else {
      const totals = shotTotals(score.shots, score.isSpot === true);
      if (totals.result !== result || totals.tens !== tens || totals.nines !== nines) {
        errors.result = 'Das Resultat passt nicht zu den Pfeilen auf der Scheibe.';
      }
    }
  }
  return errors;
}

export function scoreErrors(score: ScoreInput, today: IsoDate = todayInClub()): string[] {
  return Object.values(scoreFieldErrors(score, today));
}

/** "40cm Spot" */
export function targetLabel(score: Pick<ScoreInput, 'targetSize' | 'isSpot'>): string {
  return `${score.targetSize}cm${score.isSpot ? ' Spot' : ''}`;
}

function isComplete(shots: readonly (Shot | null)[], arrows: number | null): shots is Shot[] {
  return shots.length === arrows && shots.every(isShot);
}
