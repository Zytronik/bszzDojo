import {
  DestroyRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Router, Scroll } from '@angular/router';

/**
 * Back on a page (browser back, or the header's back link), scrolls to where it was left once
 * `ready()` says its content is there. The router restores the position by itself too, but right
 * after the navigation, before the page's data has loaded, when the page is still too short.
 * Injection context only.
 */
export function restoreScrollWhen(ready: () => boolean): void {
  const injector = inject(Injector);
  const target = signal<[number, number] | null>(null);
  const subscription = inject(Router).events.subscribe((event) => {
    if (event instanceof Scroll && event.position) target.set(event.position);
  });
  inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  effect(() => {
    const position = target();
    if (!position || !ready()) return;
    untracked(() => target.set(null));
    afterNextRender(() => window.scrollTo(position[0], position[1]), { injector });
  });
}
