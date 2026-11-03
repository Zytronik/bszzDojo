import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STREAK_STRIP_WEEKS, weeksLabel, type TrainingStreak } from '@bszz-dojo/shared';
import { streak as streakRecipe } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faFire } from '../ui/icons';

/** The logged-in archer's weeks in a row with training, and what keeps the streak going. */
@Component({
  selector: 'app-streak-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div [class]="styles.root" [attr.data-done]="streak().thisWeek || null">
      <span [class]="styles.icon"><app-icon [icon]="icon" /></span>
      <div>
        <p [class]="styles.count">{{ count() }}</p>
        <p [class]="styles.status">{{ status() }}</p>
      </div>
      <ol [class]="styles.weeks" [attr.aria-label]="stripLabel">
        @for (trained of streak().recent; track $index) {
          <li
            [class]="styles.week"
            [attr.data-trained]="trained || null"
            [attr.data-current]="$last || null"
            [attr.aria-label]="weekLabel($index, trained)"
          ></li>
        }
      </ol>
      @if (streak().best > 0) {
        <p [class]="styles.best">Rekord: {{ best() }} in Folge</p>
      }
    </div>
  `,
})
export class StreakCard {
  readonly streak = input.required<TrainingStreak>();

  protected readonly styles = streakRecipe();
  protected readonly icon = faFire;
  protected readonly stripLabel = `Die letzten ${STREAK_STRIP_WEEKS} Wochen`;
  protected readonly count = computed(() => `${weeksLabel(this.streak().current)} in Folge`);
  protected readonly best = computed(() => weeksLabel(this.streak().best));
  protected readonly status = computed(() => {
    const { current, best, thisWeek } = this.streak();
    if (thisWeek) return 'Diese Woche erledigt. Weiter so!';
    if (current > 0) return 'Trainiere bis Sonntag, damit deine Serie hält.';
    return best > 0
      ? 'Trainiere diese Woche, um eine neue Serie zu starten.'
      : 'Trainiere diese Woche, um deine erste Serie zu starten.';
  });

  protected weekLabel(index: number, trained: boolean): string {
    const ago = STREAK_STRIP_WEEKS - 1 - index;
    const when = ago === 0 ? 'Diese Woche' : ago === 1 ? 'Letzte Woche' : `Vor ${ago} Wochen`;
    return `${when}: ${trained ? 'trainiert' : 'kein Training'}`;
  }
}
