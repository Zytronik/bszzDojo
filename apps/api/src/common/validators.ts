import { isValidEmail, isValidUsername } from '@bszz-dojo/shared';
import { ValidateBy, type ValidationOptions } from 'class-validator';

/** The shared username rules, so the API and the forms can't drift apart. */
export function IsUsername(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUsername',
      validator: { validate: (value: unknown): boolean => typeof value === 'string' && isValidUsername(value) },
    },
    options,
  );
}

export function IsEmailAddress(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isEmailAddress',
      validator: { validate: (value: unknown): boolean => typeof value === 'string' && isValidEmail(value) },
    },
    options,
  );
}
