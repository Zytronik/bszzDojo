import type { ConfigService } from '@nestjs/config';
import { API_PREFIX, isRecord } from '@bszz-dojo/shared';
import type { CookieOptions, Request, Response } from 'express';
import { REFRESH_TOKEN_TTL_MS } from './token.service';

export const REFRESH_COOKIE = 'bszz_refresh';

function cookieOptions(config: ConfigService): CookieOptions {
  // lax works because the web app reaches the API on its own origin (Vercel rewrite, dev proxy).
  return {
    httpOnly: true,
    secure: config.get<string>('COOKIE_SECURE') !== 'false',
    sameSite: 'lax',
    // Only sent to the auth endpoints, never with any other request.
    path: `/${API_PREFIX}/auth`,
  };
}

export function readRefreshCookie(request: Request): string | null {
  const cookies: unknown = request.cookies;
  if (!isRecord(cookies)) return null;
  const value = cookies[REFRESH_COOKIE];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function setRefreshCookie(response: Response, token: string, config: ConfigService): void {
  response.cookie(REFRESH_COOKIE, token, {
    ...cookieOptions(config),
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

export function clearRefreshCookie(response: Response, config: ConfigService): void {
  response.clearCookie(REFRESH_COOKIE, cookieOptions(config));
}
