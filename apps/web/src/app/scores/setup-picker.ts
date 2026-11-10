import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import type { ArcherySetup } from '@bszz-dojo/shared';
import { SettingsStore } from '../settings/settings.store';
import { SetupBar } from './setup-bar';
import { SetupDialog } from './setup-dialog';

/** The archer's current setup (`SettingsStore`), shown as a bar that opens the setup dialog. */
@Component({
  selector: 'app-setup-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SetupBar, SetupDialog],
  template: `
    <app-setup-bar [setup]="settings.setup()" [disabled]="disabled()" (edit)="open.set(true)" />
    <app-setup-dialog
      [open]="open()"
      [current]="settings.setup()"
      [recent]="settings.recentSetups()"
      (picked)="pick($event)"
      (closed)="open.set(false)"
    />
  `,
})
export class SetupPicker {
  readonly disabled = input(false);
  /** After the archer picked one; the store has it already */
  readonly changed = output<ArcherySetup>();

  protected readonly settings = inject(SettingsStore);
  protected readonly open = signal(false);

  protected pick(setup: ArcherySetup): void {
    this.settings.useSetup(setup);
    this.open.set(false);
    this.changed.emit(setup);
  }
}
