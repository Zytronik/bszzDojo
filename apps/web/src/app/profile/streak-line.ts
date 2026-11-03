import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { weeksLabel, type TrainingStreak } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { Icon } from '../ui/icon';
import { faFire } from '../ui/icons';

/** A profile's weeks in a row with training, under the name; the flame is lit once this week is. */
@Component({
  selector: 'app-streak-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <p [class]="styles.root">
      <span [class]="styles.flame" [attr.data-done]="streak().thisWeek || null">
        <app-icon [icon]="icon" [label]="flameLabel()" />
      </span>
      <span><strong>{{ current() }}</strong> Trainingsserie</span>
      @if (streak().best > streak().current) {
        <span [class]="styles.record">· Rekord: {{ best() }}</span>
      }
    </p>
  `,
})
export class StreakLine {
  readonly streak = input.required<TrainingStreak>();

  protected readonly icon = faFire;
  protected readonly current = computed(() => weeksLabel(this.streak().current));
  protected readonly best = computed(() => weeksLabel(this.streak().best));
  protected readonly flameLabel = computed(() =>
    this.streak().thisWeek ? 'Diese Woche trainiert' : 'Diese Woche noch kein Training',
  );
  protected readonly styles = {
    root: css({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      columnGap: '5',
      m: '0',
      marginBlockEnd: '5',
    }),
    flame: css({
      layerStyle: 'muted',
      '&[data-done]': { color: 'accent.default', opacity: 'full' },
    }),
    record: css({ layerStyle: 'muted' }),
  };
}
