import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { css } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { AppUpdateService } from '../core/app-update.service';

/** Shown when the service worker has downloaded a new version of the app. */
@Component({
  selector: 'app-update-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (updates.updateReady()) {
      <div [class]="styles" role="status">
        <span>Eine neue Version ist verfügbar.</span>
        <button type="button" [class]="buttonStyles" (click)="updates.reload()">
          Aktualisieren
        </button>
      </div>
    }
  `,
})
export class UpdateBanner {
  protected readonly updates = inject(AppUpdateService);
  protected readonly styles = css({
    layerStyle: 'surface',
    position: 'fixed',
    insetX: '15',
    bottom: '15',
    zIndex: 'banner',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15',
    p: '15',
    borderRadius: 'sm',
    animation: 'fadeIn',
    md: { insetX: 'auto', right: '15', maxWidth: 'container.sm' },
  });
  protected readonly buttonStyles = button({ size: 'inline' });
}
