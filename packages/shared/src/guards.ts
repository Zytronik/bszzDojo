export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

/** Whether `value` is one of `options`, narrowed to their type */
export function isOneOf<T extends string | number>(
  options: readonly T[],
  value: unknown,
): value is T {
  return (options as readonly unknown[]).includes(value);
}
