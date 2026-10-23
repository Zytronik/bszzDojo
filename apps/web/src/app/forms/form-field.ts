import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  computed,
  contentChild,
  inject,
  input,
  signal,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { field, input as inputRecipe } from 'styled-system/recipes';
import { errorText } from './validators';

let nextFieldId = 0;

/**
 * The input or select of a `FormField`: links it to the label, styles it, and works out the error
 * to show. Errors appear once the field was touched (left, or `markAllAsTouched()` on submit), so
 * an empty form doesn't start out red.
 */
@Directive({
  selector: 'input[appFieldControl], select[appFieldControl]',
  host: {
    '[id]': 'field.id',
    '[class]': 'styles',
    '[attr.aria-invalid]': 'error() ? true : null',
    '[attr.aria-describedby]': 'field.describedBy()',
  },
})
export class FieldControl implements OnInit {
  protected readonly field = inject(FormField);
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly styles = inputRecipe();
  readonly error = signal<string | null>(null);

  // `formControlName` only has its control from here on.
  ngOnInit(): void {
    const control = this.ngControl.control;
    if (!control) return;
    const update = (): void => {
      this.error.set(control.touched && control.invalid ? errorText(control.errors) : null);
    };
    // Value, status and touched changes, also from `reset()` and sibling re-validation.
    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(update);
    update();
  }
}

/**
 * A labelled form row: `<app-form-field label="Name:"><input appFieldControl … /></app-form-field>`.
 * Shows the control's error below it, otherwise the optional hint.
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'styles.root' },
  template: `
    <label [for]="id" [class]="styles.label">{{ label() }}</label>
    <ng-content />
    @if (error(); as error) {
      <span [id]="messageId" [class]="styles.error">{{ error }}</span>
    } @else if (hint()) {
      <span [id]="messageId" [class]="styles.hint">{{ hint() }}</span>
    }
  `,
})
export class FormField {
  readonly label = input.required<string>();
  readonly hint = input<string>();

  readonly id = `field-${nextFieldId++}`;
  protected readonly messageId = `${this.id}-message`;
  protected readonly styles = field();
  private readonly control = contentChild(FieldControl);

  protected readonly error = computed(() => this.control()?.error() ?? null);
  readonly describedBy = computed(() => (this.error() || this.hint() ? this.messageId : null));
}
