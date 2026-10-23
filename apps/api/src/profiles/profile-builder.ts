import {
  BOW_TYPE_IDS,
  PERSONAL_BESTS_PER_DISTANCE,
  PROFILE_HISTORY_SIZE,
  type DistanceProgress,
  type PersonalBests,
  type ProfileStats,
  type Score,
} from '@bszz-dojo/shared';

/** A user's round as the profile needs it; `scores` passed in are sorted oldest first. */
export interface ProfileRound extends Score {
  createdAt: Date;
}

export function profileStats(rounds: readonly ProfileRound[]): ProfileStats {
  if (rounds.length === 0) return { averagePerArrow: null, totalScores: 0 };
  const sum = rounds.reduce((total, round) => total + round.result / round.arrows, 0);
  return {
    averagePerArrow: Math.round((sum / rounds.length) * 100) / 100,
    totalScores: rounds.length,
  };
}

function strip({ createdAt: _createdAt, ...score }: ProfileRound): Score {
  return score;
}

function distances(rounds: readonly ProfileRound[]): number[] {
  return [...new Set(rounds.map((round) => round.distance))].toSorted((a, b) => a - b);
}

/** Top results per distance, any number of arrows; on a tie the earlier round first. */
export function personalBests(rounds: readonly ProfileRound[]): PersonalBests[] {
  return distances(rounds).map((distance) => ({
    distance,
    scores: rounds
      .filter((round) => round.distance === distance)
      .toSorted((a, b) => b.result - a.result)
      .slice(0, PERSONAL_BESTS_PER_DISTANCE)
      .map((round, index) => ({ ...strip(round), rank: index + 1 })),
  }));
}

export function progress(rounds: readonly ProfileRound[]): DistanceProgress[] {
  return distances(rounds).map((distance) => {
    const atDistance = rounds.filter((round) => round.distance === distance);
    return {
      distance,
      series: BOW_TYPE_IDS.filter((bowType) =>
        atDistance.some((round) => round.bowType === bowType),
      )
        .toSorted()
        .map((bowType) => ({
          bowType,
          points: atDistance
            .filter((round) => round.bowType === bowType)
            .map(({ shotOn, result }) => ({ shotOn, result })),
        })),
    };
  });
}

export function history(rounds: readonly ProfileRound[]): Score[] {
  return rounds.slice(-PROFILE_HISTORY_SIZE).toReversed().map(strip);
}
