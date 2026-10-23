import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { failure, type Feedback } from '../core/feedback';

/*
 * Every validator here answers with the German message to show, so `FormField` can display it
 * without knowing the rule (see `errorText`).
 */

export const REQUIRED_MESSAGE = 'Bitte fülle dieses Feld aus.';

/** Empty strings (also only spaces) and `null` count as missing. */
export function required(message: string = REQUIRED_MESSAGE): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    const empty = value === null || (typeof value === 'string' && value.trim().length === 0);
    return empty ? { required: message } : null;
  };
}

/** `message` whenever `isValid` rejects the value; `T` is the control's value type. */
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

/** The message to show for a control's errors: the first one a validator above gave. */
export function errorText(errors: ValidationErrors | null): string | null {
  if (!errors) return null;
  for (const value of Object.values(errors) as unknown[]) {
    if (typeof value === 'string') return value;
  }
  // Angular's own validators (e.g. `Validators.min`) only say which rule failed.
  return 'Ungültige Eingabe.';
}

/** The form's message when a submit stopped at invalid fields. */
export const INVALID_FORM: Feedback = failure('Bitte korrigiere die markierten Felder.');

/** On submit: shows every field's error and tells whether the form can be sent. */
export function checkForm(form: AbstractControl): boolean {
  form.markAllAsTouched();
  return form.valid;
}
