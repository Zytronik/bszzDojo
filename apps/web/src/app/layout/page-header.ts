import { Location } from '@angular/common';
import {
  DestroyRef,
  Directive,
  Injectable,
  TemplateRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

/** Where a detail page's back link goes */
export interface PageOrigin {
  back: string[];
  backLabel: string;
}

/** What a detail page shows in the header instead of the logo and the navigation */
export interface PageHeaderBar {
  back: readonly string[];
  /** Next to the arrow, e.g. whose round it is */
  label: string;
  /** Names the link for screen readers, as the label alone doesn't say it leads back */
  backLabel: string;
  /** The page's own buttons on the right; declared in the page, so they call its methods */
  actions: TemplateRef<unknown>;
}

// A plain signal rather than a SignalStore: the store deep-freezes its state in dev mode, which a
// TemplateRef can't survive.
@Injectable({ providedIn: 'root' })
export class PageHeaderState {
  readonly bar = signal<PageHeaderBar | null>(null);

  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private previousUrl: string | null = null;
  private currentUrl: string | null = null;
  private lastDuelOrigin: PageOrigin | null = null;

  constructor() {
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;
      this.previousUrl = this.currentUrl;
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  /**
   * Where a duel page leads back to: the profile it was opened from, else the dashboard. Call it
   * when the page is created, which is before its `NavigationEnd`: `currentUrl` is still the page
   * it came from. Moving between duel pages (new duel → duel → rematch) keeps the first origin.
   */
  duelOrigin(): PageOrigin {
    const path = this.currentUrl?.split(/[?#]/)[0] ?? '';
    if (path.startsWith('/duels/') && this.lastDuelOrigin) return this.lastDuelOrigin;
    const profile = /^\/profile\/([^/]+)$/.exec(path)?.[1];
    this.lastDuelOrigin = profile
      ? { back: ['/profile', decodeURIComponent(profile)], backLabel: 'Zurück zum Profil' }
      : { back: ['/'], backLabel: 'Zurück zur Startseite' };
    return this.lastDuelOrigin;
  }

  urlOf(back: readonly string[]): string {
    return this.router.serializeUrl(this.router.createUrlTree(back));
  }

  /**
   * Back in the browser's history when that's where the page was opened from, so the page comes
   * back as it was left (scroll position, rows loaded with "Mehr laden"). Otherwise a new visit.
   */
  goBack(back: readonly string[]): void {
    const url = this.urlOf(back);
    // Usernames in URLs are matched ignoring case.
    if (this.previousUrl?.toLowerCase() === url.toLowerCase()) this.location.back();
    else void this.router.navigateByUrl(url);
  }

  /** Only the page's own bar: the next page may already have set its bar by then. */
  clear(actions: TemplateRef<unknown>): void {
    if (this.bar()?.actions === actions) this.bar.set(null);
  }
}

/**
 * `<ng-template appPageHeader [back]="…" label="…" backLabel="…">buttons</ng-template>` puts a
 * back link and the buttons in the header for as long as the page is open.
 */
@Directive({ selector: 'ng-template[appPageHeader]' })
export class PageHeader {
  readonly back = input.required<readonly string[]>();
  readonly label = input.required<string>();
  readonly backLabel = input.required<string>();

  constructor() {
    const state = inject(PageHeaderState);
    const actions = inject(TemplateRef);
    effect(() => {
      const bar = { back: this.back(), label: this.label(), backLabel: this.backLabel(), actions };
      untracked(() => state.bar.set(bar));
    });
    inject(DestroyRef).onDestroy(() => state.clear(actions));
  }
}
