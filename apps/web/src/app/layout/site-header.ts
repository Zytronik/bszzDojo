import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_NAME } from '@bszz-dojo/shared';
import { cx } from 'styled-system/css';
import { container, siteHeader } from 'styled-system/recipes';
import { AuthStore } from '../auth/auth.store';
import { Icon } from '../ui/icon';
import { faCirclePlus, faCrown, faGear, faMagnifyingGlass, faUser } from '../ui/icons';
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

  protected readonly appName = APP_NAME;
  protected readonly icons = { faCirclePlus, faCrown, faGear, faMagnifyingGlass, faUser };
  protected readonly styles = siteHeader();
  protected readonly barStyles = cx(container(), this.styles.bar);
  protected readonly whiteLogo = siteHeader({ logo: 'dark' }).logo;
  protected readonly darkLogo = siteHeader({ logo: 'light' }).logo;
}
