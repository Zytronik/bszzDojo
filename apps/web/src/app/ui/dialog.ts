import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { modal } from 'styled-system/recipes';

let nextDialogId = 0;

/**
 * A dialog with a title and projected content, e.g. a form. Closes on the ×, a click on the
 * backdrop or Escape; the content stays alive while closed, so a half-filled form keeps its
 * values.
 */
@Component({
  selector: 'app-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open() && closed.emit()' },
  template: `
    @if (open()) {
      <div [class]="styles.backdrop" (click)="closed.emit()">
        <div
          [class]="styles.content"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            [class]="styles.close"
            aria-label="Schliessen"
            (click)="closed.emit()"
          >
            &times;
          </button>
          <h2 [id]="titleId" [class]="styles.title">{{ title() }}</h2>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class Dialog {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly closed = output();

  protected readonly styles = modal({ tone: 'form' });
  protected readonly titleId = `dialog-${nextDialogId++}`;
}
