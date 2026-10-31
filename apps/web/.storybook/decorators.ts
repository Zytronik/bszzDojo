import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { applicationConfig } from '@storybook/angular-vite';

/** For components with a `routerLink` */
export const withRouter = applicationConfig({
  providers: [provideRouter([], withDisabledInitialNavigation())],
});

/** For charts: they follow the theme from `SettingsStore`, which needs HTTP. */
export const withHttp = applicationConfig({ providers: [provideHttpClient()] });
