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
    // After `scores/new`, which would match too.
    path: 'scores/:id',
    canActivate: [authGuard],
    // Lazy, so Chart.js only downloads when a round is opened.
    loadComponent: (): Promise<Type<unknown>> =>
      import('./pages/score-page').then((m) => m.ScorePage),
    title: title('Score'),
  },
  {
    path: 'duels/new',
    canActivate: [authGuard],
    loadComponent: (): Promise<Type<unknown>> =>
      import('./pages/duel-new-page').then((m) => m.DuelNewPage),
    title: title('Neues Duell'),
  },
  {
    // After `duels/new`, which would match too.
    path: 'duels/:id',
    canActivate: [authGuard],
    loadComponent: (): Promise<Type<unknown>> =>
      import('./pages/duel-page').then((m) => m.DuelPage),
    title: title('Duell'),
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
