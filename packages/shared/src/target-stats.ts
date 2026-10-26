import type { BowTypeId } from './bow-types';
import type { TargetSize } from './scores';
import { arrowsPerEnd, isInnerTen, ringCount, shotPoints, type Shot } from './target';

/** Where the arrows landed as a group, in face units like `Shot`. */
export interface ShotGroup {
  /** Mean point of impact; y grows downwards like on screen. */
  center: Shot;
  /** Half of the arrows lie within this distance of the center. */
  halfRadius: number;
  /** Twice the standard deviation sideways and in height (about 95% of the arrows). */
  width: number;
  height: number;
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deviation(values: readonly number[], center: number): number {
  return Math.sqrt(mean(values.map((value) => (value - center) ** 2)));
}

export function shotGroup(shots: readonly Shot[]): ShotGroup | null {
  if (shots.length === 0) return null;
  const xs = shots.map((shot) => shot.x);
  const ys = shots.map((shot) => shot.y);
  const center = { x: mean(xs), y: mean(ys) };
  const distances = shots
    .map((shot) => Math.hypot(shot.x - center.x, shot.y - center.y))
    .toSorted((a, b) => a - b);
  return {
    center,
    halfRadius: distances[Math.floor((distances.length - 1) / 2)] ?? 0,
    width: 2 * deviation(xs, center.x),
    height: 2 * deviation(ys, center.y),
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
