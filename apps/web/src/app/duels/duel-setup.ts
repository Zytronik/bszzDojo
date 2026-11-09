import {
  MAX_DISTANCE,
  isBowTypeId,
  isDuelFormat,
  isInteger,
  isRecord,
  isTargetSize,
  type BowTypeId,
  type DuelFace,
  type DuelSettings,
} from '@bszz-dojo/shared';
import { readStored, writeStored } from '../core/stored';
import { loadScoreSetup } from '../scores/score-setup';

/** The last duel set up or accepted on this device, which the next one starts with. */
interface DuelSetup extends DuelSettings, DuelFace {
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
  const stored = readStored(STORAGE_KEY);
  if (isDuelSetup(stored)) return stored;
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
  writeStored(STORAGE_KEY, setup);
}
