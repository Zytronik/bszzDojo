import type { UserName } from './auth';
import { BOW_TYPES, type BowTypeId } from './bow-types';
import { isInteger, isRecord } from './guards';
import { MAX_DISTANCE, type TargetSize } from './scores';
import { isInnerTen, isShot, ringCount, shotPoints, type Shot } from './target';

/**
 * World Archery match play. `sets`: sets of 3 arrows, 2 set points for a won set and 1 each for a
 * tie, the first to 6 wins, after 5 sets at 5:5 a shoot-off. `total`: 5 ends of 3 arrows, the
 * higher total wins, a tie goes to a shoot-off. A shoot-off is one arrow each, the one closer to
 * the center wins (again while they're exactly as close).
 */
export const DUEL_FORMATS = ['sets', 'total'] as const;
export type DuelFormat = (typeof DUEL_FORMATS)[number];

export const DUEL_FORMAT_NAMES: Record<DuelFormat, string> = {
  sets: 'Satzsystem',
  total: 'Gesamtpunkte',
};

export const DUEL_ARROWS_PER_END = 3;
export const DUEL_SET_POINTS_TO_WIN = 6;
export const DUEL_MAX_SETS = 5;
export const DUEL_TOTAL_ENDS = 5;
/** An invitation nobody answers lapses, and so does a duel nobody shoots in any more. */
export const DUEL_INVITATION_HOURS = 24;
export const DUEL_IDLE_HOURS = 2;

export function isDuelFormat(value: unknown): value is DuelFormat {
  return typeof value === 'string' && (DUEL_FORMATS as readonly string[]).includes(value);
}

export type DuelSide = 'challenger' | 'opponent';
export type SidePair<T> = Record<DuelSide, T>;

export function otherSide(side: DuelSide): DuelSide {
  return side === 'challenger' ? 'opponent' : 'challenger';
}

/**
 * `invited` until the opponent answers; `declined` / `cancelled` (withdrawn by the challenger) /
 * `expired` end it before it starts. `abandoned`: nobody shot for `DUEL_IDLE_HOURS`, no winner.
 * `finished` has a winner, also when one side gave up (`forfeitedBy`).
 */
export const DUEL_STATUSES = [
  'invited',
  'declined',
  'cancelled',
  'expired',
  'active',
  'finished',
  'abandoned',
] as const;
export type DuelStatus = (typeof DUEL_STATUSES)[number];

/**
 * One arrow. `points` 0 (a miss) to 10, `x` for the inner 10. `shot` where it hit when it was
 * entered on the target, else `null`; a shoot-off arrow always has one.
 */
export interface DuelArrow {
  points: number;
  x: boolean;
  shot: Shot | null;
}

/** What the challenger picks; the opponent shoots the same, with their own bow. */
export interface DuelSettings {
  format: DuelFormat;
  /** Meters */
  distance: number;
  targetSize: TargetSize;
  isSpot: boolean;
}

/** Body of `POST /api/duels` */
export interface CreateDuelRequest extends DuelSettings {
  /** Who is challenged */
  opponent: string;
  /** The challenger's bow */
  bowType: BowTypeId;
}

/** Body of `POST /api/duels/:id/accept` */
export interface AcceptDuelRequest {
  bowType: BowTypeId;
}

/** Body of `POST /api/duels/:id/ends`: the next end, or the next shoot-off arrow. */
export interface DuelEndRequest {
  /** Which end (or shoot-off arrow) this is, from 0, so a repeated upload isn't counted twice */
  index: number;
  shootOff: boolean;
  arrows: DuelArrow[];
}

export interface DuelPlayer extends UserName {
  /** `null` while the opponent hasn't accepted yet */
  bowType: BowTypeId | null;
  /**
   * The ends both have shot, plus the viewer's own next one. The other side's next end stays
   * hidden until the viewer has shot theirs too (`ahead`).
   */
  ends: DuelArrow[][];
  shootOffs: DuelArrow[];
  /** Has shot an end (or shoot-off arrow) the viewer hasn't shot yet */
  ahead: boolean;
}

/** Response of the duel routes, from the viewer's side (`you`). */
export interface Duel extends DuelSettings {
  id: string;
  status: DuelStatus;
  /** `null` for an archer who only watches */
  you: DuelSide | null;
  challenger: DuelPlayer;
  opponent: DuelPlayer;
  winner: DuelSide | null;
  forfeitedBy: DuelSide | null;
  /** ISO timestamps */
  createdAt: string;
  updatedAt: string;
}

/** A row of the dashboard or the profile: one duel from one archer's side (`you`). */
export interface DuelSummary extends DuelSettings {
  id: string;
  status: DuelStatus;
  you: DuelSide;
  /** The other archer */
  rival: UserName;
  /** Set points or totals so far, see `duelScoreLabel` */
  score: SidePair<number>;
  /** Waiting for `you`: an invitation to answer, or the next end to shoot */
  yourTurn: boolean;
  winner: DuelSide | null;
  updatedAt: string;
}

/** Response of `GET /api/duels`: the viewer's open duels, newest first. */
export interface DuelList {
  /** Invitations the viewer can accept or decline */
  invitations: DuelSummary[];
  /** Sent and not answered yet, and the ones being shot */
  open: DuelSummary[];
}

export interface DuelRecord {
  wins: number;
  losses: number;
}

/** Response of `GET /api/profiles/:username/duels` */
export interface ProfileDuels {
  record: DuelRecord;
  /** Against the viewer; `null` on the viewer's own profile */
  againstYou: DuelRecord | null;
  /** The profile owner's latest duels, open ones too, from their side */
  recent: DuelSummary[];
}

// ---- Rules ----

/** Points × factor percent, so archers with different bows compare exactly, without rounding. */
export function weighted(points: number, bowType: BowTypeId): number {
  return points * BOW_TYPES[bowType].factorPercent;
}

export function endTotal(arrows: readonly DuelArrow[]): number {
  return arrows.reduce((sum, arrow) => sum + arrow.points, 0);
}

export interface DuelEndResult {
  totals: SidePair<number>;
  /** Totals × factor percent (× 100 when both have the same bow); the higher wins the end */
  weighted: SidePair<number>;
  /** Set points it gave; `null` in the `total` format */
  setPoints: SidePair<number> | null;
}

export type DuelPhase = 'ends' | 'shootOff' | 'decided';

export interface DuelProgress {
  /** The ends both have shot */
  ends: DuelEndResult[];
  /** Set points, or the summed `weighted` totals in the `total` format */
  score: SidePair<number>;
  phase: DuelPhase;
  /** The end (or shoot-off arrow) being shot, from 0 */
  next: number;
  winner: DuelSide | null;
}

export interface DuelArrows {
  format: DuelFormat;
  bowTypes: SidePair<BowTypeId>;
  ends: SidePair<readonly (readonly DuelArrow[])[]>;
  shootOffs: SidePair<readonly DuelArrow[]>;
}

function compare(a: number, b: number): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1;
}

/** How far a shoot-off arrow is from the center, in face units */
export function centerDistance(arrow: DuelArrow): number {
  return arrow.shot ? Math.hypot(arrow.shot.x, arrow.shot.y) : Number.POSITIVE_INFINITY;
}

/** Where a duel stands after the arrows both sides have shot. */
export function duelProgress({ format, bowTypes, ends, shootOffs }: DuelArrows): DuelProgress {
  const shot = Math.min(ends.challenger.length, ends.opponent.length);
  // With the same bow the factor changes nothing, so the totals stay plain points (× 100).
  const weigh = (points: number, side: DuelSide): number =>
    bowTypes.challenger === bowTypes.opponent ? points * 100 : weighted(points, bowTypes[side]);
  const results: DuelEndResult[] = [];
  const score: SidePair<number> = { challenger: 0, opponent: 0 };

  for (let index = 0; index < shot; index++) {
    const totals = {
      challenger: endTotal(ends.challenger[index] ?? []),
      opponent: endTotal(ends.opponent[index] ?? []),
    };
    const weights = {
      challenger: weigh(totals.challenger, 'challenger'),
      opponent: weigh(totals.opponent, 'opponent'),
    };
    let setPoints: SidePair<number> | null = null;
    if (format === 'sets') {
      const order = compare(weights.challenger, weights.opponent);
      setPoints = {
        challenger: order > 0 ? 2 : order === 0 ? 1 : 0,
        opponent: order < 0 ? 2 : order === 0 ? 1 : 0,
      };
      score.challenger += setPoints.challenger;
      score.opponent += setPoints.opponent;
    } else {
      score.challenger += weights.challenger;
      score.opponent += weights.opponent;
    }
    results.push({ totals, weighted: weights, setPoints });
    if (format === 'sets' && Math.max(score.challenger, score.opponent) >= DUEL_SET_POINTS_TO_WIN) {
      const winner = score.challenger > score.opponent ? 'challenger' : 'opponent';
      return { ends: results, score, phase: 'decided', next: results.length, winner };
    }
  }

  const regularEnds = format === 'sets' ? DUEL_MAX_SETS : DUEL_TOTAL_ENDS;
  if (results.length < regularEnds) {
    return { ends: results, score, phase: 'ends', next: results.length, winner: null };
  }
  if (format === 'total' && score.challenger !== score.opponent) {
    const winner = score.challenger > score.opponent ? 'challenger' : 'opponent';
    return { ends: results, score, phase: 'decided', next: results.length, winner };
  }

  // Level after the regular ends: one arrow each until one is closer to the center.
  const arrows = Math.min(shootOffs.challenger.length, shootOffs.opponent.length);
  for (let index = 0; index < arrows; index++) {
    const challenger = shootOffs.challenger[index];
    const opponent = shootOffs.opponent[index];
    if (!challenger || !opponent) break;
    const order = compare(centerDistance(opponent), centerDistance(challenger));
    if (order !== 0) {
      const winner = order > 0 ? 'challenger' : 'opponent';
      return { ends: results, score, phase: 'decided', next: index + 1, winner };
    }
  }
  return { ends: results, score, phase: 'shootOff', next: arrows, winner: null };
}

/** "4" set points, or a total in points, with the factor when the bows differ ("285,6") */
export function duelScoreLabel(format: DuelFormat, value: number): string {
  if (format === 'sets') return String(value);
  return (value / 100).toLocaleString('de-CH', { maximumFractionDigits: 2 });
}

/** "X", "10" … "1", "M" */
export function arrowLabel(arrow: Pick<DuelArrow, 'points' | 'x'>): string {
  if (arrow.x) return 'X';
  return arrow.points === 0 ? 'M' : String(arrow.points);
}

/**
 * The values an archer can enter with the keys: on a spot only 6–10 and misses. Compound archers
 * only get 10 for the X (see `shotPoints`), so they have no plain 10.
 */
export function arrowChoices(
  isSpot: boolean,
  bowType: BowTypeId,
): Pick<DuelArrow, 'points' | 'x'>[] {
  const lowest = 11 - ringCount(isSpot);
  const choices: Pick<DuelArrow, 'points' | 'x'>[] = [{ points: 10, x: true }];
  if (bowType !== 'cp') choices.push({ points: 10, x: false });
  for (let points = 9; points >= lowest; points--) choices.push({ points, x: false });
  choices.push({ points: 0, x: false });
  return choices;
}

export function isDuelArrow(value: unknown): value is DuelArrow {
  return (
    isRecord(value) &&
    isInteger(value['points']) &&
    typeof value['x'] === 'boolean' &&
    (value['shot'] === null || isShot(value['shot']))
  );
}

/** German messages; empty when the arrows are fine for this duel and bow. */
export function duelEndErrors(
  arrows: readonly DuelArrow[],
  settings: Pick<DuelSettings, 'isSpot'>,
  bowType: BowTypeId,
  shootOff: boolean,
): string[] {
  const expected = shootOff ? 1 : DUEL_ARROWS_PER_END;
  if (arrows.length !== expected) {
    return [shootOff ? 'Im Stechen zählt ein Pfeil.' : `Eine Passe hat ${expected} Pfeile.`];
  }
  const allowed = arrowChoices(settings.isSpot, bowType);
  for (const arrow of arrows) {
    if (!isDuelArrow(arrow)) return ['Ungültiger Pfeil.'];
    if (shootOff && arrow.shot === null) return ['Setze den Pfeil im Stechen auf der Scheibe.'];
    if (arrow.shot) {
      if (
        shotPoints(arrow.shot, settings.isSpot, bowType) !== arrow.points ||
        (arrow.points === 10 && isInnerTen(arrow.shot, settings.isSpot)) !== arrow.x
      ) {
        return ['Die Punkte passen nicht zum Pfeil auf der Scheibe.'];
      }
    } else if (!allowed.some((choice) => choice.points === arrow.points && choice.x === arrow.x)) {
      return ['Ungültiger Pfeil.'];
    }
  }
  return [];
}

export function duelSettingsErrors(settings: DuelSettings): string[] {
  const errors: string[] = [];
  if (!isDuelFormat(settings.format)) errors.push('Ungültiges Format.');
  if (
    !isInteger(settings.distance) ||
    settings.distance < 1 ||
    settings.distance > MAX_DISTANCE
  ) {
    errors.push(`Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`);
  }
  return errors;
}

/** "Satzsystem · 18m · 40cm Spot" */
export function duelSettingsLabel(settings: DuelSettings): string {
  return `${DUEL_FORMAT_NAMES[settings.format]} · ${settings.distance}m · ${settings.targetSize}cm${
    settings.isSpot ? ' Spot' : ''
  }`;
}
