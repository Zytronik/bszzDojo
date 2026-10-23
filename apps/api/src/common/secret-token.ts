import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

/**
 * Tokens handed to the browser or sent by mail are `<id>.<secret>`: the id finds the row, and only
 * a sha256 of the secret is stored, so a database leak can't be replayed.
 */
export interface SecretToken {
  id: string;
  secret: string;
  token: string;
  secretHash: string;
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function createSecretToken(): SecretToken {
  const id = randomUUID();
  const secret = randomBytes(32).toString('base64url');
  return { id, secret, token: `${id}.${secret}`, secretHash: hashSecret(secret) };
}

export function parseSecretToken(token: string): { id: string; secret: string } | null {
  const [id, secret, ...rest] = token.split('.');
  if (!id || !secret || rest.length > 0) return null;
  return { id, secret };
}

export function secretMatches(secret: string, storedHash: string): boolean {
  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(hashSecret(secret), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
