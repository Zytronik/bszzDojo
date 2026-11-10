import type { PushMessage } from '@bszz-dojo/shared';

/** The icon of the installed app (`manifest.webmanifest`) */
const ICON = '/img/fav/android-icon-192x192.png';

interface PushText {
  title: string;
  body: string;
  /** A newer message with the same tag replaces the older one on the device */
  tag: string;
  /** Opened in the app by a tap */
  url: string;
}

export function pushMessage({ title, body, tag, url }: PushText): PushMessage {
  return {
    notification: {
      title,
      body,
      icon: ICON,
      tag,
      renotify: true,
      data: { onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url } } },
    },
  };
}
