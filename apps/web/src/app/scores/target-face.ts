import { ringCount } from '@bszz-dojo/shared';

/**
 * Canvas can't read CSS tokens, and these are the target face's own colors, not theme colors, so
 * they stay the same in the light theme. Per ring pair from the outside: 1–2 white, 3–4 black,
 * 5–6 blue, 7–8 red, 9–10 gold (World Archery).
 */
const RING_COLORS = ['#ffffff', '#1f1f1f', '#1a5fd0', '#e0262b', '#f8d21c'] as const;
const RING_LINE_COLOR = '#000000';
export const SHOT_COLOR = '#ffae00';

/** Centered on the context's origin. */
export function drawTargetFace(
  context: CanvasRenderingContext2D,
  faceRadius: number,
  isSpot: boolean,
  lineWidth = 1,
): void {
  const rings = ringCount(isSpot);
  const ringWidth = faceRadius / rings;
  context.strokeStyle = RING_LINE_COLOR;
  context.lineWidth = lineWidth;
  for (let ring = rings; ring > 0; ring--) {
    // Ring number 1–10 counted from the outside; a spot starts at 6.
    const number = 11 - ring;
    context.beginPath();
    context.arc(0, 0, ring * ringWidth, 0, Math.PI * 2);
    context.fillStyle = RING_COLORS[Math.floor((number - 1) / 2)] ?? RING_LINE_COLOR;
    context.fill();
    context.stroke();
  }
  // The inner 10 (X ring), half as wide as the 10.
  context.beginPath();
  context.arc(0, 0, ringWidth / 2, 0, Math.PI * 2);
  context.stroke();
}

export function drawShot(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  lineWidth = 1,
): void {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.strokeStyle = RING_LINE_COLOR;
  context.lineWidth = lineWidth;
  context.stroke();
}
