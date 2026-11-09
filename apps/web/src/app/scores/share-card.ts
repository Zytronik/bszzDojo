import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  viewChild,
} from '@angular/core';
import {
  BOW_TYPES,
  formatGermanDate,
  shownName,
  targetLabel,
  type ScoreDetail,
  type Shot,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { recordLabel } from './record-label';
import { SHOT_COLOR, drawShot, drawTargetFace } from './target-face';

/** Instagram's portrait format; WhatsApp and the rest show it whole too. */
export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

const PADDING = 80;
const LOGO_URL = '/img/logo_weiss.png';
const LOGO_HEIGHT = 110;
const TARGET_CENTER_Y = 690;
const TARGET_RADIUS = 290;
const SHOT_RADIUS = 9;

export interface ShareCardColors {
  background: string;
  text: string;
  muted: string;
  accent: string;
}

/**
 * Canvas can't read tokens: the `shareCard.*` ones are read back from CSS variables. They don't
 * change with the theme, so every shared card looks the same.
 */
export function shareCardColors(element: Element): ShareCardColors {
  const style = getComputedStyle(element);
  const read = (name: string): string =>
    style.getPropertyValue(`--colors-share-card-${name}`).trim();
  return {
    background: read('bg'),
    text: read('fg'),
    muted: read('muted'),
    accent: read('accent'),
  };
}

let logo: Promise<HTMLImageElement | null> | null = null;

/** Without the logo (offline before it was cached) the card is drawn without it. */
function loadLogo(): Promise<HTMLImageElement | null> {
  logo ??= new Promise((resolve) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => resolve(null));
    image.src = LOGO_URL;
  });
  return logo;
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (context.measureText(text).width <= maxWidth) return text;
  let shortened = text;
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened.trimEnd()}…`;
}

function drawTarget(context: CanvasRenderingContext2D, score: ScoreDetail): void {
  const shots = (score.shots ?? []).filter((shot): shot is Shot => shot !== null);

  context.save();
  context.translate(SHARE_CARD_WIDTH / 2, TARGET_CENTER_Y);
  // Always the whole face, never zoomed: a miss lies next to it, on the card.
  drawTargetFace(context, TARGET_RADIUS, score.isSpot, 2);
  for (const shot of shots) {
    drawShot(context, shot.x * TARGET_RADIUS, shot.y * TARGET_RADIUS, SHOT_RADIUS, SHOT_COLOR, 3);
  }
  context.restore();
}

/** Text in alternating colors, the way the app highlights values: `[plain, highlighted, …]`. */
function drawRun(
  context: CanvasRenderingContext2D,
  parts: readonly string[],
  x: number,
  y: number,
  colors: readonly [string, string],
): void {
  let left = x;
  parts.forEach((part, index) => {
    context.fillStyle = colors[index % 2];
    context.fillText(part, left, y);
    left += context.measureText(part).width;
  });
}

/** On a canvas of `SHARE_CARD_WIDTH` × `SHARE_CARD_HEIGHT` px. */
export async function drawShareCard(
  canvas: HTMLCanvasElement,
  score: ScoreDetail,
  colors: ShareCardColors,
): Promise<void> {
  const image = await loadLogo();
  const font = getComputedStyle(document.body).fontFamily;
  await document.fonts.ready;
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const right = SHARE_CARD_WIDTH - PADDING;
  const textWidth = right - PADDING;

  context.fillStyle = colors.background;
  context.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  context.textBaseline = 'alphabetic';

  let brandX = PADDING;
  if (image) {
    const width = (image.width / image.height) * LOGO_HEIGHT;
    context.drawImage(image, PADDING, 60, width, LOGO_HEIGHT);
    brandX += width + 28;
  }
  context.fillStyle = colors.text;
  context.font = `700 52px ${font}`;
  context.fillText('BSZZ Dojo', brandX, 134);

  const record = recordLabel(score);
  if (record) {
    context.fillStyle = colors.accent;
    context.font = `700 36px ${font}`;
    context.textAlign = 'right';
    context.fillText(record, right, 134);
    context.textAlign = 'left';
  }

  context.fillStyle = colors.text;
  context.font = `700 72px ${font}`;
  context.fillText(fitText(context, shownName(score), textWidth), PADDING, 290);
  context.fillStyle = colors.muted;
  context.font = `40px ${font}`;
  context.fillText(formatGermanDate(score.shotOn), PADDING, 348);

  drawTarget(context, score);

  context.fillStyle = colors.accent;
  context.font = `700 180px ${font}`;
  const result = String(score.result);
  context.fillText(result, PADDING, 1155);
  const resultWidth = context.measureText(result).width;
  context.fillStyle = colors.muted;
  context.font = `44px ${font}`;
  context.fillText('Punkte', PADDING + resultWidth + 24, 1155);

  context.fillStyle = colors.text;
  context.font = `40px ${font}`;
  const setup = `${BOW_TYPES[score.bowType].name} · ${score.distance}m · ${targetLabel(score)}`;
  context.fillText(fitText(context, setup, textWidth), PADDING, 1232);
  drawRun(
    context,
    [`${score.arrows} Pfeile · 10er: `, `x${score.tens}`, ' 9er: ', `x${score.nines}`],
    PADDING,
    1288,
    [colors.muted, colors.accent],
  );
}

export async function shareCardBlob(score: ScoreDetail, colors: ShareCardColors): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await drawShareCard(canvas, score, colors);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Kein Bild'))),
      'image/png',
    );
  });
}

/** The image a round is shared as, scaled down to fit. */
@Component({
  selector: 'app-share-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas [class]="styles" role="img" [attr.aria-label]="label()"></canvas>`,
})
export class ShareCard {
  readonly score = input.required<ScoreDetail>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly styles = css({
    display: 'block',
    w: 'full',
    maxW: 'canvas',
    aspectRatio: '4 / 5',
    mx: 'auto',
    rounded: 'md',
  });
  protected readonly label = computed(
    () => `Bild: ${shownName(this.score())}, ${this.score().result} Punkte`,
  );

  constructor() {
    afterRenderEffect(() => {
      const element = this.canvas().nativeElement;
      void drawShareCard(element, this.score(), shareCardColors(element));
    });
  }
}
