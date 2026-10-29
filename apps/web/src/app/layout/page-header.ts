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
