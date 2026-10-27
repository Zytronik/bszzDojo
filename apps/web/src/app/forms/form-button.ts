import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { button, spinner } from 'styled-system/recipes';

/** While `pending`, it's disabled and shows a spinner before its label. */
@Component({
  selector: 'button[appButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'styles',
    '[disabled]': 'pending() || disabled()',
    '[attr.aria-busy]': 'pending() || null',
  },
  template: `
    @if (pending()) {
      <span [class]="spinnerStyles" aria-hidden="true"></span>
    }
    <ng-content />
  `,
})
export class FormButton {
  readonly pending = input(false);
  readonly disabled = input(false);

  protected readonly styles = button();
  protected readonly spinnerStyles = spinner();
}
