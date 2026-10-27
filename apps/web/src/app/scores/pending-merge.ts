import {
  LEADERBOARD_ARROWS,
  LEADERBOARD_SIZE,
  PERSONAL_BESTS_PER_DISTANCE,
  PROFILE_HISTORY_SIZE,
  adjustedResult,
  type DistanceLeaderboard,
  type LeaderboardEntry,
  type Profile,
  type Rankings,
  type Score,
  type UserName,
} from '@bszz-dojo/shared';

/**
 * Rounds saved offline, merged into what the server sent, so they show before they're uploaded.
 * The rules follow the API's (`rankings/leaderboard.ts`, `profiles/profile-builder.ts`); the
 * server's answer replaces all of it once they're uploaded.
 */
export type ShownLeaderboardEntry = LeaderboardEntry & { pending?: boolean };

/** Higher adjusted result first; on a tie whoever shot it first (the server's round). */
function beats(a: LeaderboardEntry, b: LeaderboardEntry): boolean {
  if (a.adjustedResult !== b.adjustedResult) return a.adjustedResult > b.adjustedResult;
  return a.shotOn < b.shotOn;
}

function mergeBoard(
  board: DistanceLeaderboard,
  pending: readonly Score[],
  user: UserName,
): DistanceLeaderboard {
  const candidates: ShownLeaderboardEntry[] = pending
    .filter((score) => score.distance === board.distance && score.arrows === LEADERBOARD_ARROWS)
    .map((score) => ({
      rank: 0,
      username: user.username,
      displayName: user.displayName,
      adjustedResult: adjustedResult(score.result, score.bowType),
      result: score.result,
      tens: score.tens,
      nines: score.nines,
      bowType: score.bowType,
      targetSize: score.targetSize,
      isSpot: score.isSpot,
      shotOn: score.shotOn,
      pending: true,
    }));
  const best = candidates.reduce<ShownLeaderboardEntry | null>(
    (current, entry) => (current === null || beats(entry, current) ? entry : current),
    null,
  );
  if (best === null) return board;
  const own = board.entries.find((entry) => entry.username === user.username);
  if (own && !beats(best, own)) return board;

  const entries = [...board.entries.filter((entry) => entry !== own), best]
    .toSorted((a, b) => (beats(a, b) ? -1 : beats(b, a) ? 1 : 0))
    .slice(0, LEADERBOARD_SIZE)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
  return { ...board, entries };
}

export function withPendingRankings(
  rankings: Rankings,
  pending: readonly Score[],
  user: UserName | null,
): Rankings {
  if (!user || pending.length === 0) return rankings;
  const { year, month } = rankings.month;
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
  const thisMonth = pending.filter((score) => score.shotOn.startsWith(monthPrefix));
  return {
    ...rankings,
    allTime: rankings.allTime.map((board) => mergeBoard(board, pending, user)),
    monthly: rankings.monthly.map((board) => mergeBoard(board, thisMonth, user)),
  };
}

/** For the archer's own profile only; others don't have rounds waiting on this device. */
export function withPendingProfile(profile: Profile, pending: readonly Score[]): Profile {
  if (pending.length === 0) return profile;
  const newestFirst = pending.toSorted((a, b) => (a.shotOn < b.shotOn ? 1 : -1));
  const { averagePerArrow, totalScores } = profile.stats;
  const perArrow = pending.reduce((sum, score) => sum + score.result / score.arrows, 0);
  const total = totalScores + pending.length;

  const distances = [
    ...new Set([
      ...profile.personalBests.map((group) => group.distance),
      ...pending.map((s) => s.distance),
    ]),
  ].toSorted((a, b) => a - b);

  return {
    ...profile,
    stats: {
      totalScores: total,
      averagePerArrow:
        Math.round((((averagePerArrow ?? 0) * totalScores + perArrow) / total) * 100) / 100,
    },
    personalBests: distances.map((distance) => ({
      distance,
      scores: [
        ...(profile.personalBests.find((group) => group.distance === distance)?.scores ?? []),
        ...pending
          .filter((score) => score.distance === distance)
          .map((score) => ({ ...score, rank: 0 })),
      ]
        // Stable: on a tie the server's (earlier) round stays first.
        .toSorted((a, b) => b.result - a.result)
        .slice(0, PERSONAL_BESTS_PER_DISTANCE)
        .map((score, index) => ({ ...score, rank: index + 1 })),
    })),
    progress: distances.map((distance) => {
      const group = profile.progress.find((entry) => entry.distance === distance);
      const atDistance = pending.filter((score) => score.distance === distance);
      const bowTypes = [
        ...new Set([
          ...(group?.series ?? []).map((series) => series.bowType),
          ...atDistance.map((s) => s.bowType),
        ]),
      ].toSorted();
      return {
        distance,
        series: bowTypes.map((bowType) => ({
          bowType,
          points: [
            ...(group?.series.find((series) => series.bowType === bowType)?.points ?? []),
            ...atDistance
              .filter((score) => score.bowType === bowType)
              .map(({ shotOn, result }) => ({ shotOn, result })),
          ].toSorted((a, b) => (a.shotOn < b.shotOn ? -1 : a.shotOn > b.shotOn ? 1 : 0)),
        })),
      };
    }),
    history: [...newestFirst, ...profile.history].slice(0, PROFILE_HISTORY_SIZE),
  };
}
