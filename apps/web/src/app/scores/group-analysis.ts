import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { faceUnitsToCm, type ShotGroup, type TargetSize } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { card } from 'styled-system/recipes';

/** Below this the offset is noise, not something to correct with the sight. */
const SIGHT_HINT_CM = 2;

function cm(value: number): string {
  return `${Math.abs(value).toFixed(1)} cm`;
}

/**
 * The group in words and real centimetres: where it lies, how tight and what shape, each with the
 * mark `TargetCanvas` draws for it (cross, circle, box).
 */
@Component({
  selector: 'app-group-analysis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="styles.fact">
      <p [class]="styles.title">
        <span [class]="styles.swatch" aria-hidden="true"
          ><span [class]="styles.mark.center">+</span></span
        >
        <span [class]="styles.muted">Lage der Gruppe</span>
      </p>
      <p>
        Im Schnitt <span [class]="styles.value">{{ position().side }}</span> und
        <span [class]="styles.value">{{ position().height }}</span
        >.
      </p>
      @if (position().sight; as sight) {
        <p [class]="styles.hint">Visier etwas nach {{ sight }}, in Richtung der Gruppe.</p>
      }
    </div>
    <div [class]="styles.fact">
      <p [class]="styles.title">
        <span [class]="styles.swatch" aria-hidden="true"
          ><span [class]="styles.mark.half"></span
        ></span>
        <span [class]="styles.muted">Streuung</span>
      </p>
      <p>
        Die Hälfte der Pfeile liegt innerhalb von
        <span [class]="styles.value">{{ spread().half }}</span> um den Treffpunkt.
      </p>
    </div>
    <div [class]="styles.fact">
      <p [class]="styles.title">
        <span [class]="styles.swatch" aria-hidden="true"
          ><span [class]="styles.mark.area"></span
        ></span>
        <span [class]="styles.muted">Form der Gruppe</span>
      </p>
      <p>
        {{ spread().counted }} liegen in einem Bereich von
        <span [class]="styles.value">{{ spread().height }}</span> Höhe und
        <span [class]="styles.value">{{ spread().width }}</span> Breite{{ spread().shape }}
      </p>
    </div>
  `,
  host: { '[class]': 'styles.root' },
})
export class GroupAnalysis {
  readonly group = input.required<ShotGroup>();
  readonly targetSize = input.required<TargetSize>();
  readonly isSpot = input(false);
  /** All arrows of the round, of which the group's area counts `areaShots` */
  readonly shots = input.required<number>();

  private toCm(value: number): number {
    return faceUnitsToCm(value, this.targetSize(), this.isSpot());
  }

  protected readonly position = computed(() => {
    const x = this.toCm(this.group().center.x);
    // Face units grow downwards, like the screen.
    const y = -this.toCm(this.group().center.y);
    const horizontal = x >= 0 ? 'rechts' : 'links';
    const vertical = y >= 0 ? 'oben' : 'unten';
    const parts = [
      Math.abs(x) >= SIGHT_HINT_CM ? horizontal : null,
      Math.abs(y) >= SIGHT_HINT_CM ? vertical : null,
    ].filter((part) => part !== null);
    return {
      side: `${cm(x)} ${horizontal}`,
      height: `${cm(y)} ${y >= 0 ? 'hoch' : 'tief'}`,
      sight: parts.length > 0 ? parts.join(' ') : null,
    };
  });

  protected readonly spread = computed(() => {
    const { area, areaShots } = this.group();
    const width = this.toCm(area.right - area.left);
    const height = this.toCm(area.bottom - area.top);
    const total = this.shots();
    const counted =
      areaShots === total ? `Alle ${total} Pfeile` : `${areaShots} von ${total} Pfeilen`;
    // Only a clear difference says something about the shape.
    const shape =
      height > width * 1.25
        ? '. Sie streuen eher in der Höhe.'
        : width > height * 1.25
          ? '. Sie streuen eher seitlich.'
          : '.';
    return {
      half: cm(this.toCm(this.group().halfRadius)),
      width: cm(width),
      height: cm(height),
      shape,
      counted,
    };
  });

  protected readonly styles = {
    root: css({ display: 'flex', flexDir: 'column', gap: '10' }),
    fact: card(),
    title: css({
      display: 'flex',
      alignItems: 'center',
      gap: '8',
      textStyle: 'body.small',
      marginBlockEnd: '5',
    }),
    muted: css({ layerStyle: 'muted' }),
    // The marks in the colors and shapes of the target, on the page background.
    swatch: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0',
      w: 'textLine',
      h: 'textLine',
      rounded: 'sm',
      bg: 'bg.canvas',
    }),
    mark: {
      center: css({
        color: 'group.center',
        fontWeight: 'bold',
        fontSize: 'xl',
        lineHeight: 'none',
      }),
      half: css({
        w: 'dot',
        h: 'dot',
        rounded: 'full',
        borderWidth: 'thick',
        borderStyle: 'solid',
        borderColor: 'group.half',
        bg: 'group.half/20',
      }),
      area: css({
        w: 'dot',
        h: 'dot',
        rounded: 'sm',
        borderWidth: 'thick',
        borderStyle: 'dashed',
        borderColor: 'group.area',
        bg: 'group.area/12',
      }),
    },
    value: css({ fontWeight: 'bold', color: 'accent.default' }),
    hint: css({ textStyle: 'body.small', layerStyle: 'muted', marginBlockStart: '5' }),
  };
}
