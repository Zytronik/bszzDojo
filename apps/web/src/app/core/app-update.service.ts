import { DOCUMENT, Injectable, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, type VersionEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/** Service worker updates: a banner when a new version is ready, and the admins' manual update. */
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

  /**
   * Installs a newer version if there is one; otherwise clears every cache and the service worker,
   * as the old app's button did, for a device stuck on a broken cache.
   */
  async forceUpdate(): Promise<void> {
    if (this.updates.isEnabled) {
      try {
        if (await this.updates.checkForUpdate()) {
          await this.updates.activateUpdate();
          this.reload();
          return;
        }
      } catch {
        // Fall through to the hard reset.
      }
    }
    const window = this.document.defaultView;
    if (window && 'caches' in window) {
      for (const name of await window.caches.keys()) await window.caches.delete(name);
    }
    const serviceWorker = window?.navigator.serviceWorker;
    if (serviceWorker) {
      for (const registration of await serviceWorker.getRegistrations()) {
        await registration.unregister();
      }
    }
    this.reload();
  }
}
