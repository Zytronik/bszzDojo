import { isRecord } from '@bszz-dojo/shared';
import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';

/** The name of the unique index a write ran into, or null for any other error. */
export function uniqueViolation(error: unknown): string | null {
  if (!(error instanceof QueryFailedError)) return null;
  const driverError: unknown = error.driverError;
  if (!isRecord(driverError) || driverError['code'] !== UNIQUE_VIOLATION) return null;
  const constraint = driverError['constraint'];
  return typeof constraint === 'string' ? constraint : '';
}
