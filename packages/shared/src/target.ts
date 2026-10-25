import type { BowTypeId } from './bow-types';
import { isRecord } from './guards';

/**
 * Where an arrow hit, in face units: the center is 0/0 and the face's outer edge has radius 1
 * (ring 1, or ring 6 on a spot), so positions don't depend on the screen or zoom.
 */
export interface Shot {
  x: number;
  y: number;
}

/** Arrows per end (Passe): 6 at 30m, as outdoors, otherwise 3. */
export function arrowsPerEnd(distance: number | null): number {
  return distance === 30 ? 6 : 3;
}
/** Shots a little outside the face are misses, but still on the drawn canvas. */
export const MAX_SHOT_OFFSET = 3;

/** A full face has rings 1–10; a spot only 6–10. */
export function ringCount(isSpot: boolean): number {
  return isSpot ? 5 : 10;
}

/**
 * 0 is a miss. An arrow on a line counts for the higher ring. Compound archers only get 10 for
 * the inner 10 (X); the rest of the 10 counts 9.
 */
export function shotPoints(shot: Shot, isSpot: boolean, bowType: BowTypeId): number {
  const rings = ringCount(isSpot);
  const ring = Math.floor(Math.hypot(shot.x, shot.y) * rings);
  if (ring >= rings) return 0;
  if (ring === 0 && bowType === 'cp' && !isInnerTen(shot, isSpot)) return 9;
  return 10 - ring;
}

/** In the inner 10 (X), half as wide as the 10. */
export function isInnerTen(shot: Shot, isSpot: boolean): boolean {
  return Math.hypot(shot.x, shot.y) * ringCount(isSpot) < 0.5;
}

export function shotTotals(
  shots: readonly Shot[],
  isSpot: boolean,
  bowType: BowTypeId,
): { result: number; tens: number; nines: number } {
  const points = shots.map((shot) => shotPoints(shot, isSpot, bowType));
  return {
    result: points.reduce((sum, value) => sum + value, 0),
    tens: points.filter((value) => value === 10).length,
    nines: points.filter((value) => value === 9).length,
  };
}

export function isShot(value: unknown): value is Shot {
  if (!isRecord(value)) return false;
  const { x, y } = value;
  return [x, y].every(
    (coordinate) =>
      typeof coordinate === 'number' &&
      Number.isFinite(coordinate) &&
      Math.abs(coordinate) <= MAX_SHOT_OFFSET,
  );
}
