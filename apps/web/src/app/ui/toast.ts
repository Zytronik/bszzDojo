import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { toast as toastRecipe } from 'styled-system/recipes';
import type { Toast } from '../layout/toast.store';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="styles[toast().status].root"
      [attr.role]="toast().status === 'error' ? 'alert' : 'status'"
    >
      <p [class]="styles[toast().status].text">{{ toast().text }}</p>
      <button
        type="button"
        [class]="styles[toast().status].close"
        aria-label="Meldung schliessen"
        (click)="dismissed.emit()"
      >
        &times;
      </button>
    </div>
  `,
})
export class ToastMessage {
  readonly toast = input.required<Toast>();
  readonly dismissed = output();

  // Both variants up front: Panda extracts styles statically, so variants aren't picked at runtime.
  protected readonly styles = {
    success: toastRecipe({ status: 'success' }),
    error: toastRecipe({ status: 'error' }),
  };
}
