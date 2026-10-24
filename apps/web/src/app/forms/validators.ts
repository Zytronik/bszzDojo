import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';

/*
 * Every validator here answers with the German message to show, so `FormField` can display it
 * without knowing the rule (see `errorText`).
 */

/** Empty strings (also only spaces) and `null` count as missing. */
export function required(message = 'Bitte fülle dieses Feld aus.'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    const empty = value === null || (typeof value === 'string' && value.trim().length === 0);
    return empty ? { required: message } : null;
  };
}

export function rule<T>(isValid: (value: T) => boolean, message: string): ValidatorFn {
  return (control: AbstractControl<T>): ValidationErrors | null =>
    isValid(control.value) ? null : { rule: message };
}

/** For rules computed elsewhere (e.g. across fields): the message, or `undefined` if valid. */
export function messageFrom(check: (control: AbstractControl) => string | undefined): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const message = check(control);
    return message === undefined ? null : { rule: message };
  };
}

/**
 * One field's message from a shared rule over the whole form (`scoreFieldErrors`, …). Pair it with
 * `revalidateOnChange`, since a change to one field can make another one (in)valid.
 */
export function formRule<T>(
  errors: (value: T) => Partial<Record<keyof T, string>>,
  field: keyof T,
): ValidatorFn {
  return messageFrom((control) => {
    const form = control.parent;
    return form instanceof FormGroup ? errors(form.getRawValue() as T)[field] : undefined;
  });
}

/** Call in an injection context (a constructor). */
export function revalidateOnChange(form: FormGroup): void {
  form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
    for (const control of Object.values(form.controls)) {
      control.updateValueAndValidity({ onlySelf: true });
    }
    form.updateValueAndValidity({ emitEvent: false });
  });
}

/** The first message a validator above gave. */
export function errorText(errors: ValidationErrors | null): string | null {
  if (!errors) return null;
  for (const value of Object.values(errors) as unknown[]) {
    if (typeof value === 'string') return value;
  }
  // Angular's own validators (e.g. `Validators.min`) only say which rule failed.
  return 'Ungültige Eingabe.';
}

export const INVALID_FORM = 'Bitte korrigiere die markierten Felder.';

/** On submit: shows every field's error and tells whether the form can be sent. */
export function checkForm(form: AbstractControl): boolean {
  form.markAllAsTouched();
  return form.valid;
}
