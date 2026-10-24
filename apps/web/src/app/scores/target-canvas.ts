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
import { ringCount, type Shot } from '@bszz-dojo/shared';
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

/** The face fills this share of the canvas, so arrows just outside it can still be placed. */
const FACE_SHARE = 0.8;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const SHOT_RADIUS = 5;

/** Tap where an arrow hit (`placed`); pinch to zoom. Shows `shots`, `selected` highlighted. */
@Component({
  selector: 'app-target-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      [class]="canvasStyles"
      aria-label="Zielscheibe: tippe, wo der Pfeil getroffen hat"
      (click)="onClick($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="lastPinchDistance = 0"
    ></canvas>
  `,
})
export class TargetCanvas {
  readonly shots = input<readonly (Shot | null)[]>([]);
  readonly selected = input<number | null>(null);
  readonly isSpot = input(false);
  readonly placed = output<Shot>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private zoom = 1;
  protected lastPinchDistance = 0;

  protected readonly canvasStyles = css({
    display: 'block',
    w: 'full',
    maxW: 'canvas',
    aspectRatio: '1',
    mx: 'auto',
    touchAction: 'none',
    cursor: 'crosshair',
  });

  constructor() {
    afterRenderEffect(() => this.draw());
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.draw());
      observer.observe(this.canvas().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected onClick(event: MouseEvent): void {
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    const faceRadius = (rect.width / 2) * FACE_SHARE * this.zoom;
    this.placed.emit({
      x: (event.clientX - rect.left - rect.width / 2) / faceRadius,
      y: (event.clientY - rect.top - rect.height / 2) / faceRadius,
    });
  }

  protected onTouchMove(event: TouchEvent): void {
    const [first, second] = [event.touches[0], event.touches[1]];
    if (event.touches.length !== 2 || !first || !second) return;
    event.preventDefault();
    const distance = Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY);
    if (this.lastPinchDistance > 0) {
      this.zoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, this.zoom * (distance / this.lastPinchDistance)),
      );
      this.draw();
    }
    this.lastPinchDistance = distance;
  }

  private draw(): void {
    const shots = this.shots();
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
    context.translate(size / 2, size / 2);

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

    shots.forEach((shot, index) => {
      if (!shot) return;
      context.beginPath();
      context.arc(shot.x * faceRadius, shot.y * faceRadius, SHOT_RADIUS, 0, Math.PI * 2);
      context.fillStyle = index === selected ? SELECTED_COLOR : SHOT_COLOR;
      context.fill();
      context.strokeStyle = RING_LINE_COLOR;
      context.stroke();
    });
  }
}
