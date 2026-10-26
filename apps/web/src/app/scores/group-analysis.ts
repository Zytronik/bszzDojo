import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { faceUnitsToCm, type ShotGroup, type TargetSize } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';

/** Below this the offset is noise, not something to correct with the sight. */
const SIGHT_HINT_CM = 2;

function cm(value: number): string {
  return `${Math.abs(value).toFixed(1)} cm`;
}

/** The group in words and real centimetres: where it lies, how tight and what shape. */
@Component({
  selector: 'app-group-analysis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="styles.fact">
      <p [class]="styles.title">Lage der Gruppe</p>
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
      <p [class]="styles.title">Streuung</p>
      <p>
        Die Hälfte der Pfeile liegt innerhalb von
        <span [class]="styles.value">{{ spread().half }}</span> um den Treffpunkt.
      </p>
    </div>
    <div [class]="styles.fact">
      <p [class]="styles.title">Form der Gruppe</p>
      <p>
        Fast alle Pfeile liegen in einem Bereich von
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
    const width = this.toCm(this.group().width);
    const height = this.toCm(this.group().height);
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
    };
  });

  protected readonly styles = {
    root: css({ display: 'flex', flexDir: 'column', gap: '10' }),
    fact: css({ layerStyle: 'surface', rounded: 'sm', p: '10' }),
    title: css({ textStyle: 'body.small', layerStyle: 'muted' }),
    value: css({ fontWeight: 'bold', color: 'accent.default' }),
    hint: css({ textStyle: 'body.small', layerStyle: 'muted', marginBlockStart: '5' }),
  };
}
