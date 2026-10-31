import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  type ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { AuthStore } from './auth/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Restore the session before the first navigation, so route guards know who's logged in.
    provideAppInitializer(() => inject(AuthStore).restoreSession()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // New pages start at the top; going back returns to where the page was left.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register once the app is idle so it doesn't compete with the first load.
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
