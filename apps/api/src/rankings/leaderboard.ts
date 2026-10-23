import {
  BADGE_PLACE_POINTS,
  LEADERBOARD_SIZE,
  adjustedResult,
  type BadgePlace,
  type BowTypeId,
  type IsoDate,
  type LeaderboardEntry,
  type MedalStanding,
  type TargetSize,
} from '@bszz-dojo/shared';

export interface LeaderboardRound {
  userId: string;
  username: string;
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
    const adjusted: AdjustedRound = { ...round, adjusted: adjustedResult(round.result, round.bowType) };
    const best = bestPerUser.get(round.userId);
    if (best === undefined || compareRounds(adjusted, best) < 0) bestPerUser.set(round.userId, adjusted);
  }
  return [...bestPerUser.values()]
    .sort(compareRounds)
    .slice(0, LEADERBOARD_SIZE)
    .map((round, index) => ({
      rank: index + 1,
      username: round.username,
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

export interface BadgeHolder {
  userId: string;
  username: string;
  place: BadgePlace;
}

/** Gold 3, silver 2, bronze 1 point; ties by more golds, then silvers, then name. */
export function buildMedalStandings(badges: readonly BadgeHolder[]): MedalStanding[] {
  const standings = new Map<string, Omit<MedalStanding, 'rank'>>();
  for (const { userId, username, place } of badges) {
    const standing = standings.get(userId) ?? { username, gold: 0, silver: 0, bronze: 0, points: 0 };
    if (place === 1) standing.gold += 1;
    if (place === 2) standing.silver += 1;
    if (place === 3) standing.bronze += 1;
    standing.points += BADGE_PLACE_POINTS[place];
    standings.set(userId, standing);
  }
  return [...standings.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gold - a.gold ||
        b.silver - a.silver ||
        a.username.localeCompare(b.username, 'de-CH'),
    )
    .slice(0, LEADERBOARD_SIZE)
    .map((standing, index) => ({ rank: index + 1, ...standing }));
}
