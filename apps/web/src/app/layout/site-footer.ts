import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_NAME, APP_VERSION } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer [class]="styles">
      <span>&copy;{{ year }} {{ appName }}</span>
      <span [class]="versionStyles">v{{ version }}</span>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
  protected readonly appName = APP_NAME;
  protected readonly version = APP_VERSION;
  protected readonly styles = css({
    layerStyle: 'surface',
    textStyle: 'body.small',
    h: 'footer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8',
  });
  protected readonly versionStyles = css({ layerStyle: 'muted' });
}
