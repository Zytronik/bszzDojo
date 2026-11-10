import {
  MAX_DISTANCE,
  isBowTypeId,
  isDuelFormat,
  isInteger,
  isRecord,
  isTargetSize,
  type ArcherySetup,
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

/**
 * The archer's current setup (bow, face, distance) with the last duel's format; without a setup,
 * the last duel's or the last round's.
 */
export function loadDuelSetup(current: ArcherySetup | null): Partial<DuelSetup> {
  const stored = readStored(STORAGE_KEY);
  const last: Partial<DuelSetup> = isDuelSetup(stored) ? stored : (loadScoreSetup() ?? {});
  if (!current) return last;
  const { bowType, distance, targetSize, isSpot } = current;
  return { format: last.format, bowType, distance, targetSize, isSpot };
}

export function saveDuelSetup(setup: DuelSetup): void {
  writeStored(STORAGE_KEY, setup);
}
