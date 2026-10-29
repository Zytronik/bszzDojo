import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_NAME } from '@bszz-dojo/shared';
import { cx } from 'styled-system/css';
import { pageContainer, siteHeader } from 'styled-system/recipes';
import { AuthStore } from '../auth/auth.store';
import { Icon } from '../ui/icon';
import { PendingScoresStore } from '../scores/pending-scores.store';
import {
  faArrowsRotate,
  faChevronLeft,
  faCirclePlus,
  faCrown,
  faGear,
  faMagnifyingGlass,
  faUser,
  faWifi,
} from '../ui/icons';
import { PageHeaderState } from './page-header';
import { SearchOverlayState } from './search-overlay.service';

interface HeaderStatus {
  text: string;
  syncing: boolean;
  styles: string;
}

@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, Icon],
  templateUrl: './site-header.html',
})
export class SiteHeader {
  protected readonly auth = inject(AuthStore);
  protected readonly search = inject(SearchOverlayState);
  protected readonly page = inject(PageHeaderState);
  private readonly pendingScores = inject(PendingScoresStore);

  private readonly statusStyles = {
    offline: siteHeader({ status: 'offline' }).status,
    syncing: siteHeader({ status: 'syncing' }).status,
  };

  /** Offline, or uploading what was changed offline; nothing once it's all on the server. */
  protected readonly status = computed((): HeaderStatus | null => {
    const waiting = this.pendingScores.waiting();
    if (this.auth.isOffline()) {
      const text =
        waiting === 0 ? 'Offline' : `Offline · ${waiting} ${waiting === 1 ? 'wartet' : 'warten'}`;
      return { text, syncing: false, styles: this.statusStyles.offline };
    }
    if (this.pendingScores.syncing() && waiting > 0) {
      return { text: 'Synchronisiere…', syncing: true, styles: this.statusStyles.syncing };
    }
    return null;
  });

  protected readonly appName = APP_NAME;
  protected readonly icons = {
    faArrowsRotate,
    faChevronLeft,
    faCirclePlus,
    faCrown,
    faGear,
    faMagnifyingGlass,
    faUser,
    faWifi,
  };
  protected readonly styles = siteHeader();
  protected readonly barStyles = cx(pageContainer(), this.styles.bar);
  protected readonly whiteLogo = siteHeader({ logo: 'dark' }).logo;
  protected readonly darkLogo = siteHeader({ logo: 'light' }).logo;
}
