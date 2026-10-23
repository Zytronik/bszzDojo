import { API_PREFIX } from '@bszz-dojo/shared';

/** Relative, so it goes to the dev server's proxy locally and to the Vercel rewrite in production. */
export function apiUrl(path: string): string {
  return `/${API_PREFIX}/${path}`;
}
