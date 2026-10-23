import { HttpErrorResponse } from '@angular/common/http';
import { isRecord } from '@bszz-dojo/shared';

const FALLBACK = 'Es ist ein Fehler aufgetreten.';

/** User-facing German message from a failed request; the API's own message when it sent one. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return FALLBACK;
  if (error.status === 0) return 'Der Server ist nicht erreichbar. Bist du online?';
  const body: unknown = error.error;
  if (!isRecord(body)) return FALLBACK;
  const message = body['message'];
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(' ');
  }
  return FALLBACK;
}
