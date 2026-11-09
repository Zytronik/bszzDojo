import {
  MAX_ARROWS,
  MAX_DISTANCE,
  isBowTypeId,
  isInteger,
  isRecord,
  isTargetSize,
  type BowTypeId,
  type TargetSize,
} from '@bszz-dojo/shared';
import { readStored, writeStored } from '../core/stored';

/** The setup of the last round saved on this device, which "Score erfassen" starts with. */
interface ScoreSetup {
  bowType: BowTypeId;
  targetSize: TargetSize;
  isSpot: boolean;
  /** Meters */
  distance: number;
  arrows: number;
}

/**
 * Per device in localStorage, not in the account: only a convenience for the next round, and
 * whatever is stored is checked before it's used.
 */
const STORAGE_KEY = 'bszz-score-setup';

function isScoreSetup(value: unknown): value is ScoreSetup {
  if (!isRecord(value)) return false;
  const { bowType, targetSize, isSpot, distance, arrows } = value;
  return (
    isBowTypeId(bowType) &&
    isTargetSize(targetSize) &&
    typeof isSpot === 'boolean' &&
    isInteger(distance) &&
    distance >= 1 &&
    distance <= MAX_DISTANCE &&
    isInteger(arrows) &&
    arrows >= 1 &&
    arrows <= MAX_ARROWS
  );
}

export function loadScoreSetup(): ScoreSetup | null {
  const stored = readStored(STORAGE_KEY);
  return isScoreSetup(stored) ? stored : null;
}

export function saveScoreSetup(setup: ScoreSetup): void {
  writeStored(STORAGE_KEY, setup);
}
