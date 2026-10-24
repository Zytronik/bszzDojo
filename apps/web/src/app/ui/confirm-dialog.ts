import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { css } from 'styled-system/css';
import { modal } from 'styled-system/recipes';
import { FormButton } from '../forms/form-button';

let nextDialogId = 0;

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormButton],
  host: { '(document:keydown.escape)': 'open() && cancelled.emit()' },
  template: `
    @if (open()) {
      <div [class]="styles.backdrop" (click)="cancelled.emit()">
        <div
          [class]="styles.content"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="textId"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            [class]="styles.close"
            aria-label="Schliessen"
            (click)="cancelled.emit()"
          >
            &times;
          </button>
          <p [id]="textId" [class]="textStyles">{{ message() }}</p>
          <button type="button" appButton [pending]="pending()" (click)="confirmed.emit()">
            {{ confirmLabel() }}
          </button>
          <button type="button" appButton (click)="cancelled.emit()">Abbrechen</button>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  readonly open = input.required<boolean>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Ja, löschen');
  readonly pending = input(false);
  readonly confirmed = output();
  readonly cancelled = output();

  protected readonly styles = modal();
  protected readonly textStyles = css({ pe: '25', marginBlockEnd: '10' });
  protected readonly textId = `confirm-dialog-${nextDialogId++}`;
}
