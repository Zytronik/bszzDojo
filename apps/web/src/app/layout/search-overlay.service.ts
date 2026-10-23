import { Injectable, signal } from '@angular/core';

/** Whether the user search under the header is open; the header toggles it, the overlay shows it. */
@Injectable({ providedIn: 'root' })
export class SearchOverlayState {
  readonly open = signal(false);

  toggle(): void {
    this.open.update((open) => !open);
  }

  close(): void {
    this.open.set(false);
  }
}
