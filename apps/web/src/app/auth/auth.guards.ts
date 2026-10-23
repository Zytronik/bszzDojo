import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

/** The session is restored before the first navigation (app initializer), so these can be sync. */
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthStore).isAuthenticated() ||
  inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

export const guestGuard: CanActivateFn = () =>
  !inject(AuthStore).isAuthenticated() || inject(Router).createUrlTree(['/']);

/** Only hides the page; the API checks the role on every admin request. */
export const adminGuard: CanActivateFn = () =>
  inject(AuthStore).isAdmin() || inject(Router).createUrlTree(['/']);
