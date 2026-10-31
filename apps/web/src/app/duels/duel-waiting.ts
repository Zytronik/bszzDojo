import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { duel } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faHourglassHalf } from '../ui/icons';

/** While a sent invitation waits for its answer. */
@Component({
  selector: 'app-duel-waiting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div [class]="styles.waiting">
      <span [class]="styles.waitingIcon"><app-icon [icon]="icon" /></span>
      <h2 [class]="styles.waitingTitle">Warte auf {{ rival() }}</h2>
      <p [class]="styles.waitingText">
        Sobald die Einladung angenommen ist, geht es los. Bis dahin findest du das Duell auf deiner
        Startseite.
      </p>
    </div>
  `,
})
export class DuelWaiting {
  /** The shown name of who was challenged */
  readonly rival = input.required<string>();

  protected readonly styles = duel();
  protected readonly icon = faHourglassHalf;
}
