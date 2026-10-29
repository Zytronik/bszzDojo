import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_NAME } from '@bszz-dojo/shared';
import { cx } from 'styled-system/css';
import { pageContainer, siteHeader } from 'styled-system/recipes';
import { AuthStore } from '../auth/auth.store';
import { Icon } from '../ui/icon';
import { PendingScoresStore } from '../scores/pending-scores.store';
import { faCirclePlus, faCrown, faGear, faMagnifyingGlass, faUser, faWifi } from '../ui/icons';
import { SearchOverlayState } from './search-overlay.service';

@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './site-header.html',
})
export class SiteHeader {
  protected readonly auth = inject(AuthStore);
  protected readonly search = inject(SearchOverlayState);
  private readonly pendingScores = inject(PendingScoresStore);

  protected readonly offlineText = computed(() => {
    const waiting = this.pendingScores.waiting();
    if (waiting === 0) return 'Offline: du siehst die zuletzt geladenen Daten';
    return waiting === 1
      ? 'Offline: 1 Änderung wartet auf den Upload'
      : `Offline: ${waiting} Änderungen warten auf den Upload`;
  });

  protected readonly appName = APP_NAME;
  protected readonly icons = { faCirclePlus, faCrown, faGear, faMagnifyingGlass, faUser, faWifi };
  protected readonly styles = siteHeader();
  protected readonly barStyles = cx(pageContainer(), this.styles.bar);
  protected readonly whiteLogo = siteHeader({ logo: 'dark' }).logo;
  protected readonly darkLogo = siteHeader({ logo: 'light' }).logo;
}
