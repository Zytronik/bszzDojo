import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { shownName } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { AppUpdateService } from '../core/app-update.service';
import { DuelsStore } from '../duels/duels.store';
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
      @if (invitation(); as invitation) {
        <app-toast [toast]="invitation.toast" action="Ansehen" (acted)="openInvitation()" />
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
  private readonly duels = inject(DuelsStore);
  private readonly router = inject(Router);
  /** An invitation that came in while the app was open; it stays until it's opened. */
  protected readonly invitation = computed(() => {
    const duel = this.duels.announcement();
    if (!duel) return null;
    const toast: Toast = {
      id: -2,
      status: 'info',
      text: `${shownName(duel.rival)} fordert dich zum Duell heraus.`,
    };
    return { id: duel.id, toast };
  });
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

  protected openInvitation(): void {
    const invitation = this.invitation();
    if (!invitation) return;
    this.duels.dismiss(invitation.id);
    void this.router.navigate(['/duels', invitation.id]);
  }
}
