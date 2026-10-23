import { HttpErrorResponse, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { apiUrl } from '../core/api-url';
import { AuthStore } from './auth.store';

const AUTH_PATH = apiUrl('auth/');

/** Adds the access token and, on a 401, refreshes it once and retries. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.startsWith(AUTH_PATH)) return next(request);

  const auth = inject(AuthStore);
  const withToken = (token: string | null): HttpRequest<unknown> =>
    token === null ? request : request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(withToken(auth.accessToken())).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return from(auth.refresh()).pipe(
        switchMap((token) => (token === null ? throwError(() => error) : next(withToken(token)))),
      );
    }),
  );
};
