import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { css } from 'styled-system/css';
import { ToastMessage } from '../ui/toast';
import { ToastStore } from './toast.store';

@Component({
  selector: 'app-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastMessage],
  template: `
    <div [class]="styles">
      @for (toast of toasts.toasts(); track toast.id) {
        <app-toast [toast]="toast" (dismissed)="toasts.dismiss(toast.id)" />
      }
    </div>
  `,
})
export class Toaster {
  protected readonly toasts = inject(ToastStore);
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
