import { DOCUMENT, computed, effect, inject, untracked } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import type { PushSubscriptionRequest } from '@bszz-dojo/shared';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { InstallService } from '../core/install.service';
import { PushApiService } from '../core/push-api.service';
import { readStored, writeStored } from '../core/stored';
import { ToastStore } from '../layout/toast.store';

interface PushState {
  /** The server's VAPID key; `null` when it sends no push messages, `undefined` until loaded */
  publicKey: string | null | undefined;
  /** This browser receives the logged-in user's push messages */
  subscribed: boolean;
  permission: NotificationPermission;
  pending: boolean;
  /** The app's own question before the browser's, which only a tap may trigger (iOS) */
  promptOpen: boolean;
}

/**
 * Per device: whether the app already asked. Asked once, so a "Später" isn't repeated; the
 * settings still offer push.
 */
const PROMPTED_KEY = 'bszz-push-prompted';

function toRequest(subscription: PushSubscription): PushSubscriptionRequest | null {
  const { endpoint, keys } = subscription.toJSON();
  const p256dh = keys?.['p256dh'];
  const auth = keys?.['auth'];
  return endpoint && p256dh && auth ? { endpoint, keys: { p256dh, auth } } : null;
}

/** Whether the browser subscribed with this server key; after a key change it must again. */
function hasKey(subscription: PushSubscription, publicKey: string): boolean {
  const key = subscription.options.applicationServerKey;
  if (!key) return false;
  const bytes = new Uint8Array(key);
  const encoded = btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
  return encoded === publicKey;
}

/**
 * Push messages for duels on this device. The browser keeps the subscription, the server which
 * user it belongs to: it's sent again at every start, so it follows whoever is logged in.
 */
export const PushStore = signalStore(
  { providedIn: 'root' },
  withState<PushState>(() => ({
    publicKey: undefined,
    subscribed: false,
    permission: typeof Notification === 'undefined' ? 'default' : Notification.permission,
    pending: false,
    promptOpen: false,
  })),
  withComputed((store, swPush = inject(SwPush), install = inject(InstallService)) => {
    const browserSupport =
      swPush.isEnabled &&
      typeof Notification !== 'undefined' &&
      typeof inject(DOCUMENT).defaultView?.PushManager !== 'undefined';
    return {
      supported: computed(() => browserSupport && typeof store.publicKey() === 'string'),
      blocked: computed(() => store.permission() === 'denied'),
      /** iPhones only allow push messages in the app installed on the home screen. */
      needsInstall: computed(
        () => !browserSupport && install.platform === 'ios' && install.canInstall(),
      ),
    };
  }),
  withMethods(
    (
      store,
      swPush = inject(SwPush),
      api = inject(PushApiService),
      toasts = inject(ToastStore),
    ) => {
      const current = (): Promise<PushSubscription | null> =>
        firstValueFrom(swPush.subscription);

      const register = async (subscription: PushSubscription): Promise<void> => {
        const request = toRequest(subscription);
        if (!request) throw new Error('Incomplete push subscription');
        await api.subscribe(request);
        patchState(store, { subscribed: true });
      };

      return {
        /** At start and after a duel was set up: asks once, where push works and isn't decided. */
        suggest(): void {
          if (
            store.supported() &&
            !store.subscribed() &&
            store.permission() === 'default' &&
            readStored(PROMPTED_KEY) !== true
          ) {
            patchState(store, { promptOpen: true });
          }
        },

        closePrompt(): void {
          patchState(store, { promptOpen: false });
          writeStored(PROMPTED_KEY, true);
        },

        async enable(): Promise<void> {
          const publicKey = store.publicKey();
          if (!publicKey) return;
          patchState(store, { pending: true });
          try {
            const subscription = await swPush.requestSubscription({ serverPublicKey: publicKey });
            await register(subscription);
            toasts.success('Mitteilungen sind auf diesem Gerät aktiviert.');
          } catch (error: unknown) {
            const denied = Notification.permission === 'denied';
            toasts.error(denied ? 'Mitteilungen wurden nicht erlaubt.' : errorMessage(error));
          } finally {
            patchState(store, { pending: false, permission: Notification.permission });
          }
        },

        /** Also before logging out, while the session can still tell the server. */
        async disable(): Promise<void> {
          const subscription = await current();
          patchState(store, { pending: true });
          try {
            if (subscription) {
              await api.unsubscribe({ endpoint: subscription.endpoint });
              await swPush.unsubscribe();
            }
            patchState(store, { subscribed: false });
          } catch (error: unknown) {
            toasts.error(errorMessage(error));
          } finally {
            patchState(store, { pending: false });
          }
        },

        /** At every start with a session: the server learns who uses this browser now. */
        async refresh(): Promise<void> {
          try {
            const { publicKey } = await api.config();
            patchState(store, { publicKey });
            if (!swPush.isEnabled || !publicKey) return;
            let subscription = await current();
            if (subscription && !hasKey(subscription, publicKey)) {
              await subscription.unsubscribe();
              subscription = await swPush.requestSubscription({ serverPublicKey: publicKey });
            }
            if (subscription) await register(subscription);
          } catch {
            // Without a connection or push service: the next start tries again.
          }
        },
      };
    },
  ),
  withHooks((store, auth = inject(AuthStore)) => ({
    onInit(): void {
      let refreshedFor: string | null = null;
      effect(() => {
        const userId = auth.status() === 'authenticated' ? (auth.user()?.id ?? null) : null;
        if (userId === null || userId === refreshedFor) return;
        refreshedFor = userId;
        untracked(() => void store.refresh());
      });
    },
  })),
);
