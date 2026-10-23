import type { Type } from '@angular/core';
import type { Routes } from '@angular/router';
import { APP_NAME } from '@bszz-dojo/shared';
import { adminGuard, authGuard, guestGuard } from './auth/auth.guards';
import { DashboardPage } from './pages/dashboard-page';
import { LoginPage } from './pages/login-page';
import { SettingsPage } from './pages/settings-page';
import { SubmitScorePage } from './pages/submit-score-page';

const title = (page: string): string => `${APP_NAME} | ${page}`;

export const routes: Routes = [
  { path: '', component: DashboardPage, canActivate: [authGuard], title: title('Dashboard') },
  { path: 'login', component: LoginPage, canActivate: [guestGuard], title: title('Login') },
  {
    path: 'profile/:username',
    canActivate: [authGuard],
    // Lazy, so Chart.js only downloads when a profile is opened.
    loadComponent: (): Promise<Type<unknown>> =>
      import('./pages/profile-page').then((m) => m.ProfilePage),
    title: title('Profil'),
  },
  {
    path: 'scores/new',
    component: SubmitScorePage,
    canActivate: [authGuard],
    title: title('Score erfassen'),
  },
  {
    path: 'settings',
    component: SettingsPage,
    canActivate: [authGuard],
    title: title('Einstellungen'),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: (): Promise<Type<unknown>> =>
      import('./pages/admin-page').then((m) => m.AdminPage),
    title: title('Admin'),
  },
  { path: '**', redirectTo: '' },
];
