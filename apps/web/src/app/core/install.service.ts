import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

export type InstallPlatform = 'ios' | 'android';

/** Chrome's install prompt; not in TypeScript's DOM types yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Per device, not per account: installing is a device thing. Only a hint that it was closed, so
 * localStorage is fine here.
 */
const DISMISSED_KEY = 'bszz-install-hint-dismissed';

/** Whether the app runs installed, and the hint that shows how to install it on a phone. */
@Injectable({ providedIn: 'root' })
export class InstallService {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly installPrompt = signal<BeforeInstallPromptEvent | null>(null);
  private readonly installed = signal(this.runsInstalled());

  /** `null` on desktops, where the hint isn't offered. */
  readonly platform: InstallPlatform | null = this.detectPlatform();
  readonly canInstall = computed(() => !this.installed() && this.platform !== null);
  /** Android's own install dialog, when the browser offers one. */
  readonly canPrompt = computed(() => this.installPrompt() !== null);
  readonly open = signal(false);

  constructor() {
    this.window?.addEventListener('beforeinstallprompt', (event) => {
      // Our hint replaces Chrome's own mini bar.
      event.preventDefault();
      this.installPrompt.set(event as BeforeInstallPromptEvent);
    });
    this.window?.addEventListener('appinstalled', () => {
      this.installed.set(true);
      this.open.set(false);
    });
  }

  /** Once per device, until it's closed. */
  suggest(): void {
    if (this.canInstall() && !this.wasDismissed()) this.open.set(true);
  }

  show(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
    try {
      this.window?.localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Storage can be unavailable (private mode); the hint then just shows again next time.
    }
  }

  async prompt(): Promise<void> {
    const event = this.installPrompt();
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    this.installPrompt.set(null);
    if (outcome === 'accepted') this.close();
  }

  private runsInstalled(): boolean {
    const navigator: (Navigator & { standalone?: boolean }) | undefined = this.window?.navigator;
    return (
      this.window?.matchMedia('(display-mode: standalone)').matches === true ||
      navigator?.standalone === true
    );
  }

  private detectPlatform(): InstallPlatform | null {
    const navigator = this.window?.navigator;
    if (!navigator) return null;
    const agent = navigator.userAgent;
    // iPadOS reports itself as a Mac; the touch screen gives it away.
    if (
      /iPhone|iPad|iPod/.test(agent) ||
      (agent.includes('Macintosh') && navigator.maxTouchPoints > 1)
    ) {
      return 'ios';
    }
    return /Android/.test(agent) ? 'android' : null;
  }

  private wasDismissed(): boolean {
    try {
      return this.window?.localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  }
}
