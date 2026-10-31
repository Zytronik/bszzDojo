import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { duel } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faFaceFrown, faHourglassHalf, faTrophy } from '../ui/icons';

export type DuelHeadlineTone = 'won' | 'lost' | 'waiting';

/** The top of a duel's page: the outcome with its icon, or the invitation waiting for an answer. */
@Component({
  selector: 'app-duel-headline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div [class]="styles.headline">
      <span [class]="styles.headlineIcon" [attr.data-tone]="tone()">
        <app-icon [icon]="icon()" />
      </span>
      <h1 [class]="styles.headlineTitle">{{ title() }}</h1>
      @if (text()) {
        <p [class]="styles.headlineText">{{ text() }}</p>
      }
    </div>
  `,
})
export class DuelHeadline {
  readonly tone = input.required<DuelHeadlineTone>();
  readonly title = input.required<string>();
  readonly text = input<string | null>(null);

  protected readonly styles = duel();
  protected readonly icon = computed(() => ICONS[this.tone()]);
}

const ICONS = { won: faTrophy, lost: faFaceFrown, waiting: faHourglassHalf };
