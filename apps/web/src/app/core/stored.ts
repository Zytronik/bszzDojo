// localStorage can be unavailable (private mode) or hold a damaged entry. Reading then gives
// `null` and writing does nothing, so every caller falls back to its defaults.

export function readStored(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // See above: kept only while the app stays open.
  }
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing could have been stored then either.
  }
}
