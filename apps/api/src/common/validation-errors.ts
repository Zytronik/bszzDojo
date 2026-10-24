import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

/**
 * The German messages of every failed rule, nested ones included, each once. Nest's default would
 * prefix nested ones with their path ("shots.0.…"), which the web app shows as is.
 */
export function validationException(errors: ValidationError[]): BadRequestException {
  const messages = new Set<string>();
  const collect = (error: ValidationError): void => {
    for (const message of Object.values(error.constraints ?? {})) messages.add(message);
    error.children?.forEach(collect);
  };
  errors.forEach(collect);
  return new BadRequestException([...messages]);
}
