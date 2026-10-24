import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { css } from 'styled-system/css';
import { AuthStore } from '../auth/auth.store';
import { InstallService } from '../core/install.service';
import { FormButton } from '../forms/form-button';
import { Dialog } from '../ui/dialog';
import { InstallSteps } from '../ui/install-steps';
import { Tabs, type TabItem } from '../ui/tabs';

/** Opens once per phone after logging in, until it's closed; the settings can open it again. */
@Component({
  selector: 'app-install-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, Tabs, InstallSteps, FormButton],
  template: `
    <app-dialog title="App installieren" [open]="install.open()" (closed)="install.close()">
      <p [class]="leadStyles">
        Speichere das BSZZ Dojo auf deinem Startbildschirm: Es startet dann wie eine App, im
        Vollbild und ohne Adressleiste.
      </p>
      <app-tabs [tabs]="tabs" [(selected)]="platform">
        @if (platform() === 'android' && install.canPrompt()) {
          <button type="button" appButton (click)="install.prompt()">Jetzt installieren</button>
          <p [class]="orStyles">oder von Hand:</p>
        }
        <app-install-steps [platform]="platform() === 'android' ? 'android' : 'ios'" />
      </app-tabs>
      <button type="button" appButton (click)="install.close()">Verstanden</button>
    </app-dialog>
  `,
})
export class InstallDialog {
  protected readonly install = inject(InstallService);
  protected readonly tabs: TabItem[] = [
    { id: 'ios', label: 'iPhone / iPad' },
    { id: 'android', label: 'Android' },
  ];
  protected readonly platform = signal<string>(this.install.platform ?? 'ios');
  protected readonly leadStyles = css({ marginBlockEnd: '10' });
  protected readonly orStyles = css({ layerStyle: 'muted', my: '10' });

  constructor() {
    const auth = inject(AuthStore);
    effect(() => {
      if (auth.isAuthenticated()) untracked(() => this.install.suggest());
    });
  }
}
