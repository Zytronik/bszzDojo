import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { weeksLabel, type TrainingStreak } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { Icon } from '../ui/icon';
import { faFire } from '../ui/icons';

/** The flame with the weeks in a row, next to the name; lit once this week is trained. */
@Component({
  selector: 'app-streak-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <span
      [class]="styles"
      role="img"
      [attr.data-done]="streak().thisWeek || null"
      [attr.aria-label]="label()"
      [attr.title]="label()"
    >
      <app-icon [icon]="icon" />
      <span aria-hidden="true">{{ streak().current }}</span>
    </span>
  `,
})
export class StreakBadge {
  readonly streak = input.required<TrainingStreak>();

  protected readonly icon = faFire;
  protected readonly label = computed(() => {
    const { current, thisWeek } = this.streak();
    const done = thisWeek ? ', diese Woche schon trainiert' : '';
    return `Trainingsserie: ${weeksLabel(current)} in Folge${done}`;
  });
  protected readonly styles = css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5',
    fontSize: 'xl',
    fontWeight: 'bold',
    layerStyle: 'muted',
    '&[data-done]': { color: 'accent.default', opacity: 'full' },
  });
}
