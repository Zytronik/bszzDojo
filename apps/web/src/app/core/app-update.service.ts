import { DOCUMENT, Injectable, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, type VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/** Service worker updates, for the banner shown when a new version is ready. */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly updates = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);
  private readonly ready = signal(false);

  readonly updateReady: Signal<boolean> = this.ready.asReadonly();

  constructor() {
    if (!this.updates.isEnabled) return;
    this.updates.versionUpdates
      .pipe(
        filter((event: VersionEvent) => event.type === 'VERSION_READY'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.ready.set(true));
  }

  reload(): void {
    this.document.location.reload();
  }
}
