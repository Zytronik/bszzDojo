/** The browsers' push services; nothing else is sent to, so the API can't be made to call others */
const PUSH_SERVICE_HOSTS = [
  'fcm.googleapis.com',
  'push.services.mozilla.com',
  'push.apple.com',
  'notify.windows.com',
];

export function isPushEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  const host = url.hostname;
  return (
    url.protocol === 'https:' &&
    PUSH_SERVICE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
  );
}
