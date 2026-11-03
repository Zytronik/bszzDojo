/**
 * Response of `GET /api/push/config`. `publicKey` is the server's VAPID key (base64url) that
 * browsers subscribe with; `null` when the server isn't set up to send push messages.
 */
export interface PushConfig {
  publicKey: string | null;
}

/** Body of `PUT /api/push/subscription`: what `PushSubscription.toJSON()` gives in the browser */
export interface PushSubscriptionRequest {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Body of `DELETE /api/push/subscription` */
export interface PushUnsubscribeRequest {
  endpoint: string;
}

/**
 * The payload of a push message, in the format Angular's service worker shows on its own, also
 * while the app is closed. A tap opens `url` in the app.
 */
export interface PushMessage {
  notification: {
    title: string;
    body: string;
    icon: string;
    /** Messages with the same tag replace each other, e.g. one per duel */
    tag: string;
    renotify: boolean;
    data: {
      onActionClick: { default: { operation: 'navigateLastFocusedOrOpen'; url: string } };
    };
  };
}
