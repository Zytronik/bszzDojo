import {
  MAX_DISTANCE,
  isBowTypeId,
  isDuelFormat,
  isInteger,
  isRecord,
  isTargetSize,
  type BowTypeId,
  type DuelSettings,
} from '@bszz-dojo/shared';
import { loadScoreSetup } from '../scores/score-setup';

/** The last duel set up or accepted on this device, which the next one starts with. */
export interface DuelSetup extends DuelSettings {
  bowType: BowTypeId;
}

/** Per device in localStorage, like the score setup: checked before it's used. */
const STORAGE_KEY = 'bszz-duel-setup';

function isDuelSetup(value: unknown): value is DuelSetup {
  if (!isRecord(value)) return false;
  const { format, bowType, targetSize, isSpot, distance } = value;
  return (
    isDuelFormat(format) &&
    isBowTypeId(bowType) &&
    isTargetSize(targetSize) &&
    typeof isSpot === 'boolean' &&
    isInteger(distance) &&
    distance >= 1 &&
    distance <= MAX_DISTANCE
  );
}

/** The last duel's setup, else the bow, face and distance of the last round */
export function loadDuelSetup(): Partial<DuelSetup> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (isDuelSetup(stored)) return stored;
  } catch {
    // Unavailable storage (private mode) or a damaged entry: fall back to the score setup.
  }
  const score = loadScoreSetup();
  return score
    ? {
        bowType: score.bowType,
        targetSize: score.targetSize,
        isSpot: score.isSpot,
        distance: score.distance,
      }
    : {};
}

export function saveDuelSetup(setup: DuelSetup): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
  } catch {
    // Storage can be unavailable (private mode); the next duel then starts with the defaults.
  }
}
