import { effect, inject, untracked } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorMessage } from '../core/error-message';

export interface Toast {
  id: number;
  status: 'success' | 'error' | 'info';
  text: string;
}

/** Errors stay longer: they usually need reading twice. */
const DURATION_MS = { success: 4000, error: 7000, info: 5000 } as const;
/** Older ones make room, so a burst of messages doesn't cover the page. */
const MAX_TOASTS = 3;

export const ToastStore = signalStore(
  { providedIn: 'root' },
  withState<{ toasts: Toast[] }>({ toasts: [] }),
  withMethods((store) => {
    let nextId = 0;

    const dismiss = (id: number): void => {
      patchState(store, { toasts: store.toasts().filter((toast) => toast.id !== id) });
    };

    const show = (status: Toast['status'], text: string): void => {
      const toast: Toast = { id: nextId++, status, text };
      patchState(store, { toasts: [...store.toasts(), toast].slice(-MAX_TOASTS) });
      setTimeout(() => dismiss(toast.id), DURATION_MS[status]);
    };

    return {
      success: (text: string): void => show('success', text),
      error: (text: string): void => show('error', text),
      dismiss,
    };
  }),
);

/** Shows a toast whenever `error` turns into an error, e.g. a `resource`'s. Injection context only. */
export function toastErrors(error: () => unknown): void {
  const toasts = inject(ToastStore);
  effect(() => {
    const current = error();
    if (current) untracked(() => toasts.error(errorMessage(current)));
  });
}
