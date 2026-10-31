import {
  arrowLabel,
  centerDistance,
  duelProgress,
  duelScoreLabel,
  endTotal,
  otherSide,
  type Duel,
  type DuelArrow,
  type DuelFormat,
  type DuelProgress,
  type DuelSide,
} from '@bszz-dojo/shared';

/** The viewer on the left, the rival on the right; an onlooker sees the challenger first. */
export interface DuelSides {
  me: DuelSide;
  them: DuelSide;
}

export function sidesOf(duel: Pick<Duel, 'you'>): DuelSides {
  const me = duel.you ?? 'challenger';
  return { me, them: otherSide(me) };
}

export function progressOf(duel: Duel): DuelProgress {
  const challengerBow = duel.challenger.bowType ?? 'r';
  return duelProgress({
    format: duel.format,
    bowTypes: { challenger: challengerBow, opponent: duel.opponent.bowType ?? challengerBow },
    ends: { challenger: duel.challenger.ends, opponent: duel.opponent.ends },
    shootOffs: { challenger: duel.challenger.shootOffs, opponent: duel.opponent.shootOffs },
  });
}

/** Whether the two shoot different bows, so their points are compared with the factors */
export function hasHandicap(duel: Duel): boolean {
  return duel.challenger.bowType !== null && duel.challenger.bowType !== duel.opponent.bowType;
}

/** "Satz" in the set system, "Passe" in the total format */
export function endName(format: DuelFormat): string {
  return format === 'sets' ? 'Satz' : 'Passe';
}

/** One row of the ends table, already from the viewer's side */
export interface EndRow {
  label: string;
  mine: string;
  theirs: string;
  /** The arrows, e.g. "X 9 9" */
  myArrows: string;
  theirArrows: string;
  /** With the factor when the bows differ, e.g. "28" */
  myWeighted: string | null;
  theirWeighted: string | null;
  /** Set points it gave ("2 : 0"), `null` in the total format */
  points: string | null;
  /** Who took the end: -1 the rival, 0 level, 1 the viewer */
  outcome: -1 | 0 | 1;
}

function arrows(end: readonly DuelArrow[]): string {
  return end.map(arrowLabel).join(' ');
}

export function endRows(duel: Duel, progress: DuelProgress): EndRow[] {
  const { me, them } = sidesOf(duel);
  const handicap = hasHandicap(duel);
  const rows = progress.ends.map((end, index): EndRow => {
    const diff = end.weighted[me] - end.weighted[them];
    return {
      label: String(index + 1),
      mine: String(end.totals[me]),
      theirs: String(end.totals[them]),
      myArrows: arrows(duel[me].ends[index] ?? []),
      theirArrows: arrows(duel[them].ends[index] ?? []),
      myWeighted: handicap ? duelScoreLabel('total', end.weighted[me]) : null,
      theirWeighted: handicap ? duelScoreLabel('total', end.weighted[them]) : null,
      points: end.setPoints ? `${end.setPoints[me]} : ${end.setPoints[them]}` : null,
      outcome: diff > 0 ? 1 : diff < 0 ? -1 : 0,
    };
  });
  const shootOffs = Math.min(duel[me].shootOffs.length, duel[them].shootOffs.length);
  for (let index = 0; index < shootOffs; index++) {
    const mine = duel[me].shootOffs[index];
    const theirs = duel[them].shootOffs[index];
    if (!mine || !theirs) break;
    const myDistance = centerDistance(mine);
    const theirDistance = centerDistance(theirs);
    rows.push({
      label: shootOffs > 1 ? `Stechen ${index + 1}` : 'Stechen',
      mine: arrowLabel(mine),
      theirs: arrowLabel(theirs),
      myArrows: '',
      theirArrows: '',
      myWeighted: null,
      theirWeighted: null,
      points: null,
      outcome: myDistance < theirDistance ? 1 : myDistance > theirDistance ? -1 : 0,
    });
  }
  return rows;
}

export function scoreLabels(
  duel: Duel,
  progress: DuelProgress,
): { mine: string; theirs: string } {
  const { me, them } = sidesOf(duel);
  return {
    mine: duelScoreLabel(duel.format, progress.score[me]),
    theirs: duelScoreLabel(duel.format, progress.score[them]),
  };
}

export function totalPoints(ends: readonly (readonly DuelArrow[])[]): number {
  return ends.reduce((sum, end) => sum + endTotal(end), 0);
}
