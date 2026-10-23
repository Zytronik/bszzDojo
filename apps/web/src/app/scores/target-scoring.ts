/** Rings from the outside in: 1–2 white, 3–4 black, 5–6 blue, 7–8 red, 9–10 gold (WA target face). */
export const RING_COUNT = 10;

/**
 * Canvas fill colors per ring pair, outermost first. Canvas can't read CSS tokens, and these are
 * the target face's own colors, not theme colors, so they stay the same in the light theme.
 */
export const RING_COLORS = ['#ffffff', '#1f1f1f', '#1a5fd0', '#e0262b', '#f8d21c'] as const;
export const RING_LINE_COLOR = '#000000';
export const ARROW_COLOR = '#ffae00';

export interface Point {
  x: number;
  y: number;
}

/** Points for an arrow at `point`, relative to the center, on a face of `radius`; 0 is a miss. */
export function scoreAt(point: Point, radius: number): number {
  const distance = Math.hypot(point.x, point.y);
  const ringWidth = radius / RING_COUNT;
  const ring = Math.floor(distance / ringWidth);
  return ring >= RING_COUNT ? 0 : RING_COUNT - ring;
}
