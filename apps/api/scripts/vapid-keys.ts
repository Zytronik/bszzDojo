/**
 * Prints a new VAPID key pair for push messages, as env lines for `.env` or Vercel. A new pair
 * makes every browser subscribe again: the app does that by itself on its next start.
 */
import { createECDH } from 'node:crypto';

const ecdh = createECDH('prime256v1');
const publicKey = ecdh.generateKeys().toString('base64url');
const privateKey = ecdh.getPrivateKey().toString('base64url');

process.stdout.write(`VAPID_PUBLIC_KEY=${publicKey}\nVAPID_PRIVATE_KEY=${privateKey}\n`);
