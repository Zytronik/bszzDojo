import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  BOW_TYPES,
  BOW_TYPE_OPTIONS,
  MAX_DISTANCE,
  TARGET_SIZES,
  isArcherySetup,
  sameSetup,
  targetLabel,
  type ArcherySetup,
  type BowTypeId,
  type TargetSize,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { formRow } from 'styled-system/recipes';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import { INVALID_FORM, checkForm, required, rule } from '../forms/validators';
import { ToastStore } from '../layout/toast.store';
import { CheckboxField } from '../ui/checkbox-field';
import { Dialog } from '../ui/dialog';

const DISTANCE = `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`;
/** Without a current setup: what most rounds in the club are shot with */
const FALLBACK: ArcherySetup = { bowType: 'r', distance: 18, targetSize: 60, isSpot: false };

/**
 * Picks the archer's current setup: one of the recent ones with a tap, or a new one. It only
 * emits `picked`; whoever opened it decides what follows (`SetupPicker` saves it).
 */
@Component({
  selector: 'app-setup-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Dialog, FormField, FieldControl, CheckboxField, FormButton],
  templateUrl: './setup-dialog.html',
})
export class SetupDialog {
  readonly open = input.required<boolean>();
  readonly current = input.required<ArcherySetup | null>();
  readonly recent = input<readonly ArcherySetup[]>([]);
  readonly picked = output<ArcherySetup>();
  readonly closed = output();

  private readonly toasts = inject(ToastStore);
  private readonly forms = inject(NonNullableFormBuilder);
  protected readonly bowTypes = BOW_TYPE_OPTIONS;
  protected readonly targetSizes = TARGET_SIZES;
  protected readonly maxDistance = MAX_DISTANCE;
  protected readonly form = this.forms.group({
    bowType: this.forms.control<BowTypeId>(FALLBACK.bowType),
    distance: this.forms.control<number | null>(FALLBACK.distance, [
      required(),
      rule((value: number | null) => value !== null && isDistance(value), DISTANCE),
    ]),
    targetSize: this.forms.control<TargetSize>(FALLBACK.targetSize),
    isSpot: FALLBACK.isSpot,
  });

  protected readonly rows = { even: formRow({ split: 'even' }), wide: formRow({ split: 'wide' }) };
  protected readonly styles = {
    heading: css({ textStyle: 'body.small', layerStyle: 'muted', marginBlockEnd: '5' }),
    recent: css({
      display: 'flex',
      flexDirection: 'column',
      gap: '8',
      marginBlockEnd: '20',
    }),
    option: css({
      layerStyle: 'surface',
      rounded: 'sm',
      p: '10',
      display: 'flex',
      gap: '8',
      w: 'full',
      textAlign: 'start',
      cursor: 'pointer',
      borderWidth: 'thick',
      borderColor: 'transparent',
      _pressed: { borderColor: 'accent.default' },
    }),
    bow: css({ fontWeight: 'bold' }),
  };

  constructor() {
    // Each time it opens, the form starts from the current setup.
    effect(() => {
      if (!this.open()) return;
      const setup = this.current() ?? FALLBACK;
      untracked(() => this.form.reset({ ...setup }));
    });
  }

  protected bowName(setup: ArcherySetup): string {
    return BOW_TYPES[setup.bowType].name;
  }

  protected details(setup: ArcherySetup): string {
    return `${setup.distance}m · ${targetLabel(setup)}`;
  }

  protected isCurrent(setup: ArcherySetup): boolean {
    const current = this.current();
    return current !== null && sameSetup(current, setup);
  }

  protected pick(setup: ArcherySetup): void {
    this.picked.emit(setup);
  }

  protected submit(): void {
    const setup = this.form.getRawValue();
    if (!checkForm(this.form) || !isArcherySetup(setup)) {
      this.toasts.error(INVALID_FORM);
      return;
    }
    this.picked.emit(setup);
  }
}

function isDistance(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= MAX_DISTANCE;
}
