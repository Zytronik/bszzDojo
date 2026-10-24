import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { css } from 'styled-system/css';
import { AppUpdateService } from '../core/app-update.service';
import { ToastMessage } from '../ui/toast';
import { ToastStore, type Toast } from './toast.store';

@Component({
  selector: 'app-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastMessage],
  template: `
    <div [class]="styles">
      @if (updates.updateReady()) {
        <app-toast [toast]="updateToast" action="Aktualisieren" (acted)="updates.reload()" />
      }
      @for (toast of toasts.toasts(); track toast.id) {
        <app-toast [toast]="toast" (dismissed)="toasts.dismiss(toast.id)" />
      }
    </div>
  `,
})
export class Toaster {
  protected readonly toasts = inject(ToastStore);
  protected readonly updates = inject(AppUpdateService);
  protected readonly updateToast: Toast = {
    id: -1,
    status: 'info',
    text: 'Eine neue Version ist verfügbar.',
  };
  protected readonly styles = css({
    pos: 'fixed',
    insetBlockStart: 'calc(token(sizes.header) + token(spacing.15))',
    insetX: '15',
    zIndex: 'toast',
    display: 'flex',
    flexDir: 'column',
    gap: '10',
    pointerEvents: 'none',
    md: { insetStart: 'auto', maxW: 'container.sm' },
  });
}
