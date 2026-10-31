import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { duel } from 'styled-system/recipes';

export interface DuelFact {
  label: string;
  value: string;
}

/** A duel's settings as a list of labels and values, e.g. on an invitation. */
@Component({
  selector: 'app-duel-facts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl [class]="styles.facts">
      @for (fact of facts(); track fact.label) {
        <dt>{{ fact.label }}</dt>
        <dd>{{ fact.value }}</dd>
      }
    </dl>
  `,
})
export class DuelFacts {
  readonly facts = input.required<readonly DuelFact[]>();

  protected readonly styles = duel();
}
