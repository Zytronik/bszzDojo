import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { arrowChoices, arrowLabel, type BowTypeId, type DuelArrow } from '@bszz-dojo/shared';
import { duel } from 'styled-system/recipes';

/** The values an arrow can have with this face and bow, as keys like on the scorecard. */
@Component({
  selector: 'app-arrow-keypad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="styles.keys" role="group" aria-label="Pfeil eingeben">
      @for (choice of choices(); track label(choice)) {
        <button
          type="button"
          [class]="styles.key"
          [disabled]="disabled()"
          (click)="picked.emit({ points: choice.points, x: choice.x, shot: null })"
        >
          {{ label(choice) }}
        </button>
      }
    </div>
  `,
})
export class ArrowKeypad {
  readonly isSpot = input(false);
  readonly bowType = input.required<BowTypeId>();
  readonly disabled = input(false);
  readonly picked = output<DuelArrow>();

  protected readonly choices = computed(() => arrowChoices(this.isSpot(), this.bowType()));
  protected readonly styles = duel();
  protected readonly label = arrowLabel;
}
