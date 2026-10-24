import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { cx } from 'styled-system/css';
import { button, toast as toastRecipe } from 'styled-system/recipes';
import type { Toast } from '../layout/toast.store';

/** With an `action`, the button replaces the ×: such a toast stays until it's used. */
@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="styles[toast().status].root"
      [attr.role]="toast().status === 'error' ? 'alert' : 'status'"
    >
      <p [class]="styles[toast().status].text">{{ toast().text }}</p>
      @if (action(); as action) {
        <button type="button" [class]="actionStyles" (click)="acted.emit()">{{ action }}</button>
      } @else {
        <button
          type="button"
          [class]="styles[toast().status].close"
          aria-label="Meldung schliessen"
          (click)="dismissed.emit()"
        >
          &times;
        </button>
      }
    </div>
  `,
})
export class ToastMessage {
  readonly toast = input.required<Toast>();
  readonly action = input<string>();
  readonly dismissed = output();
  readonly acted = output();

  // Every variant up front: Panda extracts styles statically, so variants aren't picked at runtime.
  protected readonly styles = {
    success: toastRecipe({ status: 'success' }),
    error: toastRecipe({ status: 'error' }),
    info: toastRecipe({ status: 'info' }),
  };
  protected readonly actionStyles = cx(
    button({ size: 'inline', tone: 'neutral' }),
    this.styles.info.action,
  );
}
