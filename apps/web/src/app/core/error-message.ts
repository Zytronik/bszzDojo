import { HttpErrorResponse } from '@angular/common/http';
import { isRecord } from '@bszz-dojo/shared';

const FALLBACK = 'Es ist ein Fehler aufgetreten.';

/**
 * No answer from the server: the browser's 0, or the 504 the service worker answers with when it
 * has neither a connection nor a cached copy.
 */
export function isUnreachable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status === 504);
}

/** User-facing German message from a failed request; the API's own message when it sent one. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return FALLBACK;
  if (isUnreachable(error)) return 'Der Server ist nicht erreichbar. Bist du online?';
  const body: unknown = error.error;
  if (!isRecord(body)) return FALLBACK;
  const message = body['message'];
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(' ');
  }
  return FALLBACK;
}
