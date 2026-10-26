import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ringCount, type Shot, type ShotGroup } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';

/**
 * Canvas can't read CSS tokens, and these are the target face's own colors, not theme colors, so
 * they stay the same in the light theme. Per ring pair from the outside: 1–2 white, 3–4 black,
 * 5–6 blue, 7–8 red, 9–10 gold (World Archery).
 */
const RING_COLORS = ['#ffffff', '#1f1f1f', '#1a5fd0', '#e0262b', '#f8d21c'] as const;
const RING_LINE_COLOR = '#000000';
const SHOT_COLOR = '#ffae00';
const SELECTED_COLOR = '#00e5ff';
const GROUP_COLOR = '#00e5ff';
const GROUP_CROSS = 9;

/** The face fills this share of the canvas, so arrows just outside it can still be placed. */
const FACE_SHARE = 0.8;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const WHEEL_ZOOM_STEP = 1.15;
const SHOT_RADIUS = 5;
/** A pointer that moved further than this (CSS px) pans instead of placing an arrow. */
const TAP_TOLERANCE = 6;

interface Point {
  x: number;
  y: number;
}

/**
 * Tap where an arrow hit (`placed`); drag to pan, pinch or scroll to zoom. Shows `shots`, the
 * `selected` one highlighted. Not `interactive`, it only shows them: zoomed in so they all fit,
 * with the `group` (mean point of impact, half of the arrows in its circle, the area without
 * outliers dotted around the dots).
 */
@Component({
  selector: 'app-target-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      [class]="interactive() ? canvasStyles.place : canvasStyles.view"
      [attr.aria-label]="
        interactive()
          ? 'Zielscheibe: tippe, wo der Pfeil getroffen hat'
          : 'Zielscheibe mit den Pfeilen'
      "
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="pointers.delete($event.pointerId)"
      (wheel)="onWheel($event)"
    ></canvas>
  `,
})
export class TargetCanvas {
  readonly shots = input<readonly (Shot | null)[]>([]);
  readonly selected = input<number | null>(null);
  readonly isSpot = input(false);
  readonly placed = output<Shot>();
  readonly interactive = input(true);
  /** Per shot instead of the default color, e.g. to pick out one end */
  readonly shotColors = input<readonly string[] | null>(null);
  readonly group = input<ShotGroup | null>(null);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private zoom = 1;
  /** Where the face's center is, from the canvas center, in CSS px */
  private pan: Point = { x: 0, y: 0 };
  protected readonly pointers = new Map<number, Point>();
  private tapStart: Point | null = null;
  private pinchDistance = 0;
  private fitted = false;

  protected readonly canvasStyles = {
    place: css({
      display: 'block',
      w: 'full',
      maxW: 'canvas',
      aspectRatio: '1',
      mx: 'auto',
      touchAction: 'none',
      cursor: 'crosshair',
    }),
    view: css({
      display: 'block',
      w: 'full',
      maxW: 'canvas',
      aspectRatio: '1',
      mx: 'auto',
      touchAction: 'none',
      cursor: 'grab',
    }),
  };

  constructor() {
    afterRenderEffect(() => this.draw());
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.draw());
      observer.observe(this.canvas().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected onPointerDown(event: PointerEvent): void {
    this.canvas().nativeElement.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.tapStart = this.pointers.size === 1 ? { x: event.clientX, y: event.clientY } : null;
    this.pinchDistance = this.pointerDistance();
  }

  protected onPointerMove(event: PointerEvent): void {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    this.pointers.set(event.pointerId, current);

    if (this.pointers.size >= 2) {
      const distance = this.pointerDistance();
      if (this.pinchDistance > 0) this.zoomAt(this.pointerCenter(), distance / this.pinchDistance);
      this.pinchDistance = distance;
      return;
    }
    if (
      this.tapStart &&
      Math.hypot(current.x - this.tapStart.x, current.y - this.tapStart.y) > TAP_TOLERANCE
    ) {
      this.tapStart = null;
    }
    if (!this.tapStart) this.panBy(current.x - previous.x, current.y - previous.y);
  }

  protected onPointerUp(event: PointerEvent): void {
    const wasTap = this.tapStart !== null && this.pointers.size === 1;
    this.pointers.delete(event.pointerId);
    this.pinchDistance = this.pointerDistance();
    if (wasTap && this.interactive()) this.placeAt(event.clientX, event.clientY);
    this.tapStart = null;
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoomAt(
      { x: event.clientX, y: event.clientY },
      event.deltaY < 0 ? WHEEL_ZOOM_STEP : 1 / WHEEL_ZOOM_STEP,
    );
  }

  private placeAt(clientX: number, clientY: number): void {
    const { center, faceRadius } = this.geometry();
    this.placed.emit({
      x: (clientX - center.x) / faceRadius,
      y: (clientY - center.y) / faceRadius,
    });
  }

  /** Keeps the point under the fingers (or the mouse) where it is while zooming. */
  private zoomAt(point: Point, factor: number): void {
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom * factor));
    const { center } = this.geometry();
    const applied = zoom / this.zoom;
    this.zoom = zoom;
    this.panBy((point.x - center.x) * (1 - applied), (point.y - center.y) * (1 - applied));
  }

  /** At most so far that the face's center stays on the canvas. */
  private panBy(dx: number, dy: number): void {
    const limit = (this.canvas().nativeElement.clientWidth / 2) * this.zoom;
    const clamp = (value: number): number => Math.min(limit, Math.max(-limit, value));
    this.pan = { x: clamp(this.pan.x + dx), y: clamp(this.pan.y + dy) };
    this.draw();
  }

  private geometry(): { center: Point; faceRadius: number } {
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    return {
      center: {
        x: rect.left + rect.width / 2 + this.pan.x,
        y: rect.top + rect.height / 2 + this.pan.y,
      },
      faceRadius: (rect.width / 2) * FACE_SHARE * this.zoom,
    };
  }

  private pointerDistance(): number {
    const [first, second] = [...this.pointers.values()];
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
  }

  private pointerCenter(): Point {
    const [first, second] = [...this.pointers.values()];
    if (!first || !second) return first ?? { x: 0, y: 0 };
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  }

  /** Once, when showing a round: as far in as every arrow still fits. */
  private fit(shots: readonly (Shot | null)[]): void {
    if (this.fitted || this.interactive()) return;
    const farthest = Math.max(0, ...shots.map((shot) => (shot ? Math.hypot(shot.x, shot.y) : 0)));
    if (farthest === 0) return;
    this.fitted = true;
    // Visible radius at zoom z is 1 / (FACE_SHARE × z) face units; leave a margin for the dots.
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, 0.85 / (FACE_SHARE * farthest)));
  }

  private draw(): void {
    const shots = this.shots();
    this.fit(shots);
    const selected = this.selected();
    const isSpot = this.isSpot();
    const element = this.canvas().nativeElement;
    const context = element.getContext('2d');
    if (!context) return;

    // Drawn at device resolution so the rings stay sharp on high-density screens.
    const ratio = window.devicePixelRatio || 1;
    const size = element.clientWidth;
    element.width = Math.round(size * ratio);
    element.height = Math.round(size * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size, size);
    context.translate(size / 2 + this.pan.x, size / 2 + this.pan.y);

    const faceRadius = (size / 2) * FACE_SHARE * this.zoom;
    const rings = ringCount(isSpot);
    const ringWidth = faceRadius / rings;
    for (let ring = rings; ring > 0; ring--) {
      // Ring number 1–10 counted from the outside; a spot starts at 6.
      const number = 11 - ring;
      context.beginPath();
      context.arc(0, 0, ring * ringWidth, 0, Math.PI * 2);
      context.fillStyle = RING_COLORS[Math.floor((number - 1) / 2)] ?? RING_LINE_COLOR;
      context.fill();
      context.strokeStyle = RING_LINE_COLOR;
      context.lineWidth = 1;
      context.stroke();
    }
    // The inner 10 (X ring), half as wide as the 10; it counts as a 10.
    context.beginPath();
    context.arc(0, 0, ringWidth / 2, 0, Math.PI * 2);
    context.stroke();

    const colors = this.shotColors();
    shots.forEach((shot, index) => {
      if (!shot) return;
      context.beginPath();
      context.arc(shot.x * faceRadius, shot.y * faceRadius, SHOT_RADIUS, 0, Math.PI * 2);
      context.fillStyle = index === selected ? SELECTED_COLOR : (colors?.[index] ?? SHOT_COLOR);
      context.fill();
      context.strokeStyle = RING_LINE_COLOR;
      context.stroke();
    });

    const group = this.group();
    if (group) this.drawGroup(context, group, faceRadius);
  }

  private drawGroup(context: CanvasRenderingContext2D, group: ShotGroup, faceRadius: number): void {
    const x = group.center.x * faceRadius;
    const y = group.center.y * faceRadius;
    context.strokeStyle = GROUP_COLOR;
    context.lineWidth = 2;
    context.setLineDash([5, 4]);
    context.beginPath();
    context.arc(x, y, group.halfRadius * faceRadius, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([2, 4]);
    context.lineWidth = 2;
    const { left, top, right, bottom } = group.area;
    context.strokeRect(
      left * faceRadius - SHOT_RADIUS,
      top * faceRadius - SHOT_RADIUS,
      (right - left) * faceRadius + 2 * SHOT_RADIUS,
      (bottom - top) * faceRadius + 2 * SHOT_RADIUS,
    );
    context.setLineDash([]);
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x - GROUP_CROSS, y);
    context.lineTo(x + GROUP_CROSS, y);
    context.moveTo(x, y - GROUP_CROSS);
    context.lineTo(x, y + GROUP_CROSS);
    context.stroke();
  }
}
