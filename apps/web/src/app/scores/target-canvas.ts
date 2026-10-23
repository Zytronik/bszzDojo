import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { css } from 'styled-system/css';
import { button, record } from 'styled-system/recipes';
import {
  ARROW_COLOR,
  RING_COLORS,
  RING_COUNT,
  RING_LINE_COLOR,
  scoreAt,
  type Point,
} from './target-scoring';

/** The face fills this share of the canvas, so arrows just outside it can still be placed. */
const FACE_SHARE = 0.8;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

interface Arrow {
  /** In face units: the face has radius 1, the center is 0/0. Independent of canvas size and zoom. */
  position: Point;
  score: number;
}

/**
 * Experimental (admins only, as in the old app): tap the target where each arrow hit; pinch to zoom.
 * The old version showed each score in an `alert()`; this one lists the arrows and their sum.
 */
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
    <div [class]="summaryStyles" aria-live="polite">
      <p>
        Pfeile: <span [class]="recordStyles.highlight">{{ arrows().length }}</span> Total:
        <span [class]="recordStyles.highlight">{{ total() }}</span>
      </p>
      @if (arrows().length > 0) {
        <p [class]="recordStyles.meta">{{ scoresText() }}</p>
      }
    </div>
    <div [class]="actionsStyles">
      <button
        type="button"
        [class]="buttonStyles"
        [disabled]="arrows().length === 0"
        (click)="undo()"
      >
        Letzten Pfeil entfernen
      </button>
      <button
        type="button"
        [class]="buttonStyles"
        [disabled]="arrows().length === 0"
        (click)="reset()"
      >
        Zurücksetzen
      </button>
    </div>
  `,
})
export class TargetCanvas {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly arrows = signal<readonly Arrow[]>([]);
  protected readonly total = computed(() =>
    this.arrows().reduce((sum, arrow) => sum + arrow.score, 0),
  );
  protected readonly scoresText = computed(() =>
    this.arrows()
      .map((arrow) => (arrow.score === 0 ? 'M' : String(arrow.score)))
      .join(', '),
  );

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
  protected readonly summaryStyles = css({ marginBlockStart: '15' });
  protected readonly actionsStyles = css({ display: 'flex', gap: '15' });
  protected readonly buttonStyles = button();
  protected readonly recordStyles = record();

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.draw());
      observer.observe(this.canvas().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected onClick(event: MouseEvent): void {
    const element = this.canvas().nativeElement;
    const rect = element.getBoundingClientRect();
    const faceRadius = (rect.width / 2) * FACE_SHARE * this.zoom;
    const position = {
      x: (event.clientX - rect.left - rect.width / 2) / faceRadius,
      y: (event.clientY - rect.top - rect.height / 2) / faceRadius,
    };
    this.arrows.update((arrows) => [...arrows, { position, score: scoreAt(position, 1) }]);
    this.draw();
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

  protected undo(): void {
    this.arrows.update((arrows) => arrows.slice(0, -1));
    this.draw();
  }

  protected reset(): void {
    this.arrows.set([]);
    this.zoom = 1;
    this.draw();
  }

  private draw(): void {
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
    const ringWidth = faceRadius / RING_COUNT;
    for (let ring = RING_COUNT; ring > 0; ring--) {
      context.beginPath();
      context.arc(0, 0, ring * ringWidth, 0, Math.PI * 2);
      context.fillStyle = RING_COLORS[Math.floor((RING_COUNT - ring) / 2)] ?? RING_LINE_COLOR;
      context.fill();
      context.strokeStyle = RING_LINE_COLOR;
      context.lineWidth = 1;
      context.stroke();
    }

    context.beginPath();
    context.moveTo(-5, 0);
    context.lineTo(5, 0);
    context.moveTo(0, -5);
    context.lineTo(0, 5);
    context.stroke();

    context.fillStyle = ARROW_COLOR;
    for (const { position } of this.arrows()) {
      context.beginPath();
      context.arc(position.x * faceRadius, position.y * faceRadius, 5, 0, Math.PI * 2);
      context.fill();
    }
  }
}
