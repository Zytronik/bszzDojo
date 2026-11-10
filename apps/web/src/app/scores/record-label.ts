import type { ScoreDetail } from '@bszz-dojo/shared';

/** Compared with the archer's other rounds of the same kind (`comparison`). */
export function recordLabel({ result, comparison }: ScoreDetail): string | null {
  if (comparison.best === null) return null;
  if (result > comparison.best) return 'Persönlicher Rekord';
  return result === comparison.best ? 'Rekord egalisiert' : null;
}
