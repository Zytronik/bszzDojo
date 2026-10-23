import type { Score } from '@bszz-dojo/shared';
import type { ScoreEntity } from './score.entity';

export function toScore(score: ScoreEntity): Score {
  return {
    id: score.id,
    bowType: score.bowType,
    targetSize: score.targetSize,
    isSpot: score.isSpot,
    shotOn: score.shotOn,
    distance: score.distance,
    arrows: score.arrows,
    tens: score.tens,
    nines: score.nines,
    result: score.result,
  };
}

/** Oldest first; rounds from the same day in the order they were entered. */
export function byShotOn(a: ScoreEntity, b: ScoreEntity): number {
  if (a.shotOn !== b.shotOn) return a.shotOn < b.shotOn ? -1 : 1;
  return a.createdAt.getTime() - b.createdAt.getTime();
}
