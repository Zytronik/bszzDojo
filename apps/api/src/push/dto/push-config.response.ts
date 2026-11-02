import type { PushConfig } from '@bszz-dojo/shared';

export class PushConfigResponse implements PushConfig {
  /** The VAPID key to subscribe with (`applicationServerKey`); `null` when push is off. */
  publicKey: string | null;
}
