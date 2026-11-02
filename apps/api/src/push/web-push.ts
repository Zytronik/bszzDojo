import {
  createCipheriv,
  createECDH,
  createPrivateKey,
  hkdfSync,
  randomBytes,
  sign,
  type KeyObject,
} from 'node:crypto';

/**
 * Web Push with Node's own crypto, so the API needs no native or extra packages: the payload is
 * encrypted for the browser (RFC 8291, `aes128gcm`) and the request signed with the server's VAPID
 * key (RFC 8292), which the push service checks against the key the browser subscribed with.
 */

export interface VapidKeys {
  /** Uncompressed P-256 point, base64url, as browsers take it for `applicationServerKey` */
  publicKey: string;
  /** The private scalar, base64url */
  privateKey: string;
  /** `mailto:` or `https:` contact for the push services */
  subject: string;
}

export interface PushTarget {
  endpoint: string;
  /** The browser's P-256 public key, base64url */
  p256dh: string;
  /** The browser's 16-byte auth secret, base64url */
  auth: string;
}

export type PushOutcome = 'sent' | 'gone' | 'failed';

const RECORD_SIZE = 4096;
/** How long a push service keeps a message for a device that's offline, in seconds */
const TIME_TO_LIVE = 12 * 60 * 60;
const JWT_LIFETIME_SECONDS = 12 * 60 * 60;
const REQUEST_TIMEOUT_MS = 5000;

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

export function encryptPayload(
  payload: Buffer,
  target: Pick<PushTarget, 'p256dh' | 'auth'>,
): Buffer {
  const browserKey = Buffer.from(target.p256dh, 'base64url');
  const authSecret = Buffer.from(target.auth, 'base64url');
  const ecdh = createECDH('prime256v1');
  const serverKey = ecdh.generateKeys();
  const sharedSecret = ecdh.computeSecret(browserKey);
  const salt = randomBytes(16);

  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), browserKey, serverKey]);
  const ikm = Buffer.from(hkdfSync('sha256', sharedSecret, authSecret, keyInfo, 32));
  const cek = hkdf(ikm, salt, 'Content-Encoding: aes128gcm\0', 16);
  const nonce = hkdf(ikm, salt, 'Content-Encoding: nonce\0', 12);

  const cipher = createCipheriv('aes-128-gcm', cek, nonce);
  // A single record, so it ends with the last record's delimiter (2) and needs no padding.
  const record = Buffer.concat([
    cipher.update(Buffer.concat([payload, Buffer.from([2])])),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  if (record.length > RECORD_SIZE) throw new Error('Push payload too large');

  const header = Buffer.alloc(21);
  salt.copy(header, 0);
  header.writeUInt32BE(RECORD_SIZE, 16);
  header.writeUInt8(serverKey.length, 20);
  return Buffer.concat([header, serverKey, record]);
}

export function vapidAuthorization(endpoint: string, keys: VapidKeys, now = Date.now()): string {
  const header = encodeJson({ typ: 'JWT', alg: 'ES256' });
  const claims = encodeJson({
    aud: new URL(endpoint).origin,
    exp: Math.floor(now / 1000) + JWT_LIFETIME_SECONDS,
    sub: keys.subject,
  });
  const unsigned = `${header}.${claims}`;
  // JWTs take the raw r‖s signature, not the DER encoding Node gives by default.
  const signature = sign('sha256', Buffer.from(unsigned), {
    key: signingKey(keys),
    dsaEncoding: 'ieee-p1363',
  });
  return `vapid t=${unsigned}.${signature.toString('base64url')}, k=${keys.publicKey}`;
}

/** `gone`: the browser unsubscribed or the subscription expired, so it should be forgotten. */
export async function sendPush(
  target: PushTarget,
  payload: unknown,
  keys: VapidKeys,
): Promise<PushOutcome> {
  if (!isPushEndpoint(target.endpoint)) return 'gone';
  const body = encryptPayload(Buffer.from(JSON.stringify(payload)), target);
  const response = await fetch(target.endpoint, {
    method: 'POST',
    headers: {
      Authorization: vapidAuthorization(target.endpoint, keys),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(TIME_TO_LIVE),
      Urgency: 'high',
    },
    body: new Uint8Array(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 404 || response.status === 410) return 'gone';
  return response.ok ? 'sent' : 'failed';
}

function hkdf(ikm: Buffer, salt: Buffer, info: string, length: number): Buffer {
  return Buffer.from(hkdfSync('sha256', ikm, salt, Buffer.from(info), length));
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signingKey(keys: VapidKeys): KeyObject {
  const point = Buffer.from(keys.publicKey, 'base64url');
  return createPrivateKey({
    key: {
      kty: 'EC',
      crv: 'P-256',
      d: keys.privateKey,
      x: point.subarray(1, 33).toString('base64url'),
      y: point.subarray(33, 65).toString('base64url'),
    },
    format: 'jwk',
  });
}
