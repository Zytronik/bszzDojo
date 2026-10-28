import {
  LEADERBOARD_ARROWS,
  LEADERBOARD_SIZE,
  PERSONAL_BESTS_PER_DISTANCE,
  PROFILE_HISTORY_SIZE,
  adjustedResult,
  type DistanceLeaderboard,
  type DistanceProgress,
  type LeaderboardEntry,
  type Profile,
  type ProfileStats,
  type Rankings,
  type Score,
  type UserName,
} from '@bszz-dojo/shared';
import type { PendingChanges } from './pending-scores.store';

/**
 * Rounds saved or deleted offline, merged into what the server sent, so they show before the sync.
 * The rules follow the API's (`rankings/leaderboard.ts`, `profiles/profile-builder.ts`); the
 * server's answer replaces all of it once they're uploaded.
 */
export type ShownLeaderboardEntry = LeaderboardEntry & { pending?: boolean };

/** Higher adjusted result first; on a tie whoever shot it first (the server's round). */
function beats(a: LeaderboardEntry, b: LeaderboardEntry): boolean {
  if (a.adjustedResult !== b.adjustedResult) return a.adjustedResult > b.adjustedResult;
  return a.shotOn < b.shotOn;
}

/** Leaderboard entries carry no id, so a deleted round is recognised by what it shows. */
function shows(entry: LeaderboardEntry, score: Score, distance: number): boolean {
  return (
    score.distance === distance &&
    score.arrows === LEADERBOARD_ARROWS &&
    entry.shotOn === score.shotOn &&
    entry.result === score.result &&
    entry.bowType === score.bowType &&
    entry.targetSize === score.targetSize &&
    entry.isSpot === score.isSpot
  );
}

function rerank<T extends { rank: number }>(entries: readonly T[]): T[] {
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

/**
 * Without the archer's deleted best round. Their next best isn't in the answer, so they're left
 * out until the server sends the board again.
 */
function withoutDeleted(
  board: DistanceLeaderboard,
  deleted: readonly Score[],
  user: UserName,
): DistanceLeaderboard {
  const own = board.entries.find((entry) => entry.username === user.username);
  if (!own || !deleted.some((score) => shows(own, score, board.distance))) return board;
  return { ...board, entries: rerank(board.entries.filter((entry) => entry !== own)) };
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
    .slice(0, LEADERBOARD_SIZE);
  return { ...board, entries: rerank(entries) };
}

export function withPendingRankings(
  rankings: Rankings,
  { added, deleted }: PendingChanges,
  user: UserName | null,
): Rankings {
  if (!user || added.length + deleted.length === 0) return rankings;
  const { year, month } = rankings.month;
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
  const thisMonth = added.filter((score) => score.shotOn.startsWith(monthPrefix));
  return {
    ...rankings,
    allTime: rankings.allTime.map((board) =>
      mergeBoard(withoutDeleted(board, deleted, user), added, user),
    ),
    monthly: rankings.monthly.map((board) =>
      mergeBoard(withoutDeleted(board, deleted, user), thisMonth, user),
    ),
  };
}

function statsWithout(stats: ProfileStats, deleted: readonly Score[]): ProfileStats {
  const totalScores = Math.max(0, stats.totalScores - deleted.length);
  if (totalScores === 0 || stats.averagePerArrow === null) {
    return { averagePerArrow: null, totalScores };
  }
  const perArrow = deleted.reduce((sum, score) => sum + score.result / score.arrows, 0);
  const sum = stats.averagePerArrow * stats.totalScores - perArrow;
  return { averagePerArrow: Math.round((sum / totalScores) * 100) / 100, totalScores };
}

/** The chart's points have no id either: one point per deleted round goes. */
function progressWithout(
  progress: readonly DistanceProgress[],
  deleted: readonly Score[],
): DistanceProgress[] {
  return progress
    .map((group) => ({
      ...group,
      series: group.series
        .map((series) => {
          const points = [...series.points];
          for (const score of deleted) {
            if (score.distance !== group.distance || score.bowType !== series.bowType) continue;
            const index = points.findIndex(
              (point) => point.shotOn === score.shotOn && point.result === score.result,
            );
            if (index >= 0) points.splice(index, 1);
          }
          return { ...series, points };
        })
        .filter((series) => series.points.length > 0),
    }))
    .filter((group) => group.series.length > 0);
}

/** Records only from the answer: a round just below them isn't in it, so fewer may show. */
function withoutDeletedRounds(profile: Profile, deleted: readonly Score[]): Profile {
  if (deleted.length === 0) return profile;
  const ids = new Set(deleted.map((score) => score.id));
  return {
    ...profile,
    stats: statsWithout(profile.stats, deleted),
    personalBests: profile.personalBests
      .map((group) => ({
        ...group,
        scores: rerank(group.scores.filter((score) => !ids.has(score.id))),
      }))
      .filter((group) => group.scores.length > 0),
    progress: progressWithout(profile.progress, deleted),
    history: profile.history.filter((score) => !ids.has(score.id)),
  };
}

/** For the archer's own profile only; others don't have rounds waiting on this device. */
export function withPendingProfile(
  serverProfile: Profile,
  { added: pending, deleted }: PendingChanges,
): Profile {
  const profile = withoutDeletedRounds(serverProfile, deleted);
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
      scores: rerank(
        [
          ...(profile.personalBests.find((group) => group.distance === distance)?.scores ?? []),
          ...pending
            .filter((score) => score.distance === distance)
            .map((score) => ({ ...score, rank: 0 })),
        ]
          // Stable: on a tie the server's (earlier) round stays first.
          .toSorted((a, b) => b.result - a.result)
          .slice(0, PERSONAL_BESTS_PER_DISTANCE),
      ),
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
