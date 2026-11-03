import {
  BOW_TYPES,
  LEADERBOARD_SIZE,
  MONTH_NAMES,
  type CalendarMonth,
  type DistanceLeaderboard,
  type LeaderboardEntry,
} from '@bszz-dojo/shared';

/** The monthly leaderboards' reminder goes out this many days before the month's last day. */
export const MONTH_END_NOTICE_DAYS = 3;

/**
 * Points the archer's own bow needs over their best round to reach `adjusted`: the boards compare
 * results with the handicap, rounded down, so this is the smallest raw result that gets there.
 */
function pointsTo(entry: LeaderboardEntry, adjusted: number): number {
  const needed = Math.ceil((adjusted * 100) / BOW_TYPES[entry.bowType].factorPercent);
  return Math.max(1, needed - entry.result);
}

function points(count: number): string {
  return count === 1 ? '1 Punkt' : `${count} Punkten`;
}

/**
 * Where `username` stands on this month's boards (all archers, not only the top 10), on the
 * distance with their best place; `null` without a qualifying round this month.
 */
export function monthEndText(
  boards: readonly DistanceLeaderboard[],
  username: string,
  month: CalendarMonth,
): { title: string; body: string } | null {
  let best: { distance: number; entries: LeaderboardEntry[]; index: number } | null = null;
  for (const { distance, entries } of boards) {
    const index = entries.findIndex((entry) => entry.username === username);
    if (index >= 0 && (best === null || index < best.index)) best = { distance, entries, index };
  }
  if (best === null) return null;

  const { distance, entries, index } = best;
  const own = entries[index];
  if (!own) return null;
  const title = `Noch ${MONTH_END_NOTICE_DAYS} Tage im ${MONTH_NAMES[month.month - 1] ?? 'Monat'}`;
  const place = `Du bist #${index + 1} auf ${distance}m.`;

  if (index === 0) {
    const second = entries[1];
    if (!second) return { title, body: `Du führst auf ${distance}m. Bleib dran!` };
    const lead = own.adjustedResult - second.adjustedResult;
    return {
      title,
      body:
        lead > 0
          ? `Du führst auf ${distance}m, ${lead === 1 ? '1 Punkt' : `${lead} Punkte`} vor #2.`
          : `Du führst auf ${distance}m, punktgleich mit #2.`,
    };
  }
  // A tie goes to who shot it first, so a new round has to be ahead to pass.
  const target = index < LEADERBOARD_SIZE ? entries[index - 1] : entries[LEADERBOARD_SIZE - 1];
  if (!target) return null;
  const needed = points(pointsTo(own, target.adjustedResult + 1));
  return {
    title,
    body:
      index < LEADERBOARD_SIZE
        ? `${place} Mit ${needed} mehr überholst du #${index}.`
        : `${place} Mit ${needed} mehr bist du in den Top ${LEADERBOARD_SIZE}.`,
  };
}
