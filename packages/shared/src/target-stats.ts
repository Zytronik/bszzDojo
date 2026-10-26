import type { BowTypeId } from './bow-types';
import type { TargetSize } from './scores';
import { arrowsPerEnd, isInnerTen, ringCount, shotPoints, type Shot } from './target';

/** Where the arrows landed as a group, in face units like `Shot`. */
export interface ShotGroup {
  /** Mean point of impact; y grows downwards like on screen. */
  center: Shot;
  /** Half of the arrows lie within this distance of the center. */
  halfRadius: number;
  /** The box around the arrows without the outliers (`OUTLIER_SHARE`), as edges */
  area: { left: number; top: number; right: number; bottom: number };
  /** How many arrows are in `area` */
  areaShots: number;
}

/** The arrows farthest from the center that the group's area leaves out. */
export const OUTLIER_SHARE = 0.1;
/** Fewer arrows than this are all counted: dropping one would be most of the tenth. */
const MIN_SHOTS_FOR_OUTLIERS = 10;

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function shotGroup(shots: readonly Shot[]): ShotGroup | null {
  if (shots.length === 0) return null;
  const center = { x: mean(shots.map((shot) => shot.x)), y: mean(shots.map((shot) => shot.y)) };
  const byDistance = shots
    .map((shot) => ({ shot, distance: Math.hypot(shot.x - center.x, shot.y - center.y) }))
    .toSorted((a, b) => a.distance - b.distance);
  const outliers =
    shots.length < MIN_SHOTS_FOR_OUTLIERS ? 0 : Math.floor(shots.length * OUTLIER_SHARE);
  const counted = byDistance.slice(0, shots.length - outliers).map(({ shot }) => shot);
  const xs = counted.map((shot) => shot.x);
  const ys = counted.map((shot) => shot.y);
  return {
    center,
    halfRadius: byDistance[Math.floor((byDistance.length - 1) / 2)]?.distance ?? 0,
    area: {
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...xs),
      bottom: Math.max(...ys),
    },
    areaShots: counted.length,
  };
}

/** Face units to cm. A spot is the inner half of the face, so its edge is a quarter of the size. */
export function faceUnitsToCm(value: number, targetSize: TargetSize, isSpot: boolean): number {
  return (value * targetSize) / (isSpot ? 4 : 2);
}

/**
 * Arrows per end of a stored round: rounds at 30m entered before ends of six were introduced
 * have ends of three.
 */
export function storedEndSize(distance: number, arrows: number): number {
  const perEnd = arrowsPerEnd(distance);
  return arrows % perEnd === 0 ? perEnd : 3;
}

export function endTotals(points: readonly number[], perEnd: number): number[] {
  const totals: number[] = [];
  for (let start = 0; start < points.length; start += perEnd) {
    totals.push(points.slice(start, start + perEnd).reduce((sum, value) => sum + value, 0));
  }
  return totals;
}

export interface RingCount {
  /** "X", "10" … "1", "M" */
  label: string;
  count: number;
}

/**
 * How many arrows scored each value, best first. X is its own bar; compound has no plain 10 (the
 * rest of the 10 ring counts 9), and a spot no rings below 6.
 */
export function ringDistribution(
  shots: readonly Shot[],
  isSpot: boolean,
  bowType: BowTypeId,
): RingCount[] {
  const lowest = 11 - ringCount(isSpot);
  const counts = new Map<string, number>();
  for (const shot of shots) {
    const points = shotPoints(shot, isSpot, bowType);
    const label = isInnerTen(shot, isSpot) ? 'X' : points === 0 ? 'M' : String(points);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const labels = ['X'];
  for (let value = 10; value >= lowest; value--) {
    if (value === 10 && bowType === 'cp') continue;
    labels.push(String(value));
  }
  labels.push('M');
  return labels.map((label) => ({ label, count: counts.get(label) ?? 0 }));
}
