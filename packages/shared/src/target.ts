import { isRecord } from './guards';

/**
 * Where an arrow hit, in face units: the center is 0/0 and the face's outer edge has radius 1
 * (ring 1, or ring 6 on a spot), so positions don't depend on the screen or zoom.
 */
export interface Shot {
  x: number;
  y: number;
}

export const ARROWS_PER_END = 3;
/** Shots a little outside the face are misses, but still on the drawn canvas. */
export const MAX_SHOT_OFFSET = 3;

/** A full face has rings 1–10; a spot only 6–10. */
export function ringCount(isSpot: boolean): number {
  return isSpot ? 5 : 10;
}

/** 0 is a miss. An arrow on a line counts for the higher ring. */
export function shotPoints(shot: Shot, isSpot: boolean): number {
  const rings = ringCount(isSpot);
  const ring = Math.floor(Math.hypot(shot.x, shot.y) * rings);
  return ring >= rings ? 0 : 10 - ring;
}

export function shotTotals(
  shots: readonly Shot[],
  isSpot: boolean,
): { result: number; tens: number; nines: number } {
  const points = shots.map((shot) => shotPoints(shot, isSpot));
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
