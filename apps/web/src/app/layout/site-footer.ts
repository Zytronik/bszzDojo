import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_NAME } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<footer [class]="styles">&copy;{{ year }} {{ appName }}</footer>`,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
  protected readonly appName = APP_NAME;
  protected readonly styles = css({
    layerStyle: 'surface',
    height: 'footer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
}
