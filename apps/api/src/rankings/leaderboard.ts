import {
  LEADERBOARD_SIZE,
  adjustedResult,
  type BowTypeId,
  type IsoDate,
  type LeaderboardEntry,
  type TargetSize,
} from '@bszz-dojo/shared';

export interface LeaderboardRound {
  userId: string;
  username: string;
  displayName: string | null;
  bowType: BowTypeId;
  targetSize: TargetSize;
  isSpot: boolean;
  tens: number;
  nines: number;
  result: number;
  shotOn: IsoDate;
  createdAt: Date;
}

interface AdjustedRound extends LeaderboardRound {
  adjusted: number;
}

/** Higher adjusted result first; on a tie whoever shot it first. */
function compareRounds(a: AdjustedRound, b: AdjustedRound): number {
  if (a.adjusted !== b.adjusted) return b.adjusted - a.adjusted;
  if (a.shotOn !== b.shotOn) return a.shotOn < b.shotOn ? -1 : 1;
  return a.createdAt.getTime() - b.createdAt.getTime();
}

/**
 * Each user's best round, by the result with the bow type's handicap, top `LEADERBOARD_SIZE`.
 * The old app picked each user's best raw result and applied the handicap afterwards, so a better
 * handicapped round with another bow could be missed; this compares handicapped results throughout.
 */
export function buildLeaderboard(rounds: readonly LeaderboardRound[]): LeaderboardEntry[] {
  const bestPerUser = new Map<string, AdjustedRound>();
  for (const round of rounds) {
    const adjusted: AdjustedRound = {
      ...round,
      adjusted: adjustedResult(round.result, round.bowType),
    };
    const best = bestPerUser.get(round.userId);
    if (best === undefined || compareRounds(adjusted, best) < 0)
      bestPerUser.set(round.userId, adjusted);
  }
  return [...bestPerUser.values()]
    .toSorted(compareRounds)
    .slice(0, LEADERBOARD_SIZE)
    .map((round, index) => ({
      rank: index + 1,
      username: round.username,
      displayName: round.displayName,
      adjustedResult: round.adjusted,
      result: round.result,
      tens: round.tens,
      nines: round.nines,
      bowType: round.bowType,
      targetSize: round.targetSize,
      isSpot: round.isSpot,
      shotOn: round.shotOn,
    }));
}
