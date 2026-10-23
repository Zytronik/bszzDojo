import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { css } from 'styled-system/css';
import { AuthStore } from './auth/auth.store';
import { SearchOverlay } from './layout/search-overlay';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';
import { UpdateBanner } from './layout/update-banner';
import { SettingsStore } from './settings/settings.store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SiteHeader, SearchOverlay, SiteFooter, UpdateBanner],
  template: `
    <app-site-header />
    @if (auth.isAuthenticated()) {
      <app-search-overlay />
    }
    <main [class]="mainStyles">
      <router-outlet />
    </main>
    <app-site-footer />
    <app-update-banner />
  `,
})
export class App {
  protected readonly auth = inject(AuthStore);
  protected readonly mainStyles = css({
    paddingBlockStart: 'header',
    // Together with the last section's own padding, the 30px the old pages ended with.
    paddingBlockEnd: '15',
    minH: 'calc(100dvh - token(sizes.footer))',
  });

  constructor() {
    // Created here so the account's theme is applied on every page, not only on settings.
    inject(SettingsStore);
    const router = inject(Router);

    // A refresh can fail mid-session (expired or revoked on another device): back to login.
    let wasAuthenticated = this.auth.isAuthenticated();
    effect(() => {
      const isAuthenticated = this.auth.isAuthenticated();
      if (wasAuthenticated && !isAuthenticated) untracked(() => void router.navigate(['/login']));
      wasAuthenticated = isAuthenticated;
    });
  }
}
