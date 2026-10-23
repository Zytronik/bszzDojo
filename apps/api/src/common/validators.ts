import { isValidDisplayName, isValidUsername } from '@bszz-dojo/shared';
import { ValidateBy, type ValidationOptions } from 'class-validator';

/** The shared username rules, so the API and the forms can't drift apart. */
export function IsUsername(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUsername',
      validator: {
        validate: (value: unknown): boolean => typeof value === 'string' && isValidUsername(value),
      },
    },
    options,
  );
}

/** A display name, or `null` / empty for none. */
export function IsDisplayName(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isDisplayName',
      validator: {
        validate: (value: unknown): boolean =>
          value === null || (typeof value === 'string' && isValidDisplayName(value)),
      },
    },
    options,
  );
}
