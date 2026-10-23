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
    // The accent colour sets it apart from the footer it sits above, which is a surface too.
    bg: 'accent.default',
    color: 'fg.onAccent',
    pos: 'fixed',
    insetX: '15',
    // Above the footer, not on it.
    insetBlockEnd: 'calc(token(sizes.footer) + token(spacing.15))',
    zIndex: 'banner',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15',
    p: '15',
    rounded: 'sm',
    animation: 'fadeIn',
    md: { insetStart: 'auto', insetEnd: '15', maxW: 'container.sm' },
  });
  protected readonly buttonStyles = button({ size: 'inline', tone: 'neutral' });
}
