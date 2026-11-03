import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { css } from 'styled-system/css';
import { AuthStore } from '../auth/auth.store';
import { InstallService } from '../core/install.service';
import { FormButton } from '../forms/form-button';
import { PushStore } from '../settings/push.store';
import { Dialog } from '../ui/dialog';

/**
 * Asks once per device whether to turn on push messages. Browsers only show their own question
 * after a tap (Safari not at all otherwise), so this one comes first.
 */
@Component({
  selector: 'app-push-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, FormButton],
  template: `
    <app-dialog
      title="Mitteilungen aktivieren?"
      [open]="push.promptOpen()"
      (closed)="push.closePrompt()"
    >
      <p [class]="leadStyles">
        Erfahre sofort, was im Dojo läuft, auch wenn die App geschlossen ist.
      </p>
      <div [class]="actionStyles">
        <button type="button" appButton (click)="accept()">Aktivieren</button>
        <button type="button" appButton tone="subtle" (click)="push.closePrompt()">Später</button>
      </div>
    </app-dialog>
  `,
})
export class PushDialog {
  protected readonly push = inject(PushStore);
  protected readonly leadStyles = css({ marginBlockEnd: '10' });
  protected readonly actionStyles = css({ display: 'flex', gap: '10', flexWrap: 'wrap' });

  constructor() {
    const auth = inject(AuthStore);
    const install = inject(InstallService);
    // After the install dialog, which phones get first; push needs the installed app on iOS.
    effect(() => {
      if (auth.isAuthenticated() && this.push.supported() && !install.open()) {
        untracked(() => this.push.suggest());
      }
    });
  }

  /** Straight from the tap, so the browser still counts it as one for its own question. */
  protected accept(): void {
    void this.push.enable();
    this.push.closePrompt();
  }
}
