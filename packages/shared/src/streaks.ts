import { todayInClub, type IsoDate } from './dates';

/**
 * Weeks in a row with at least one training (a recorded round or a duel end), Monday to Sunday in
 * the club's time zone. A streak isn't lost while this week is still running: it counts up to
 * last week until the archer trains this week too. Part of every profile.
 */
export interface TrainingStreak {
  current: number;
  best: number;
  /** Trained this week already, so the streak is safe until next Monday */
  thisWeek: boolean;
}

/** "1 Woche", "5 Wochen" */
export function weeksLabel(count: number): string {
  return count === 1 ? '1 Woche' : `${count} Wochen`;
}

function addDays(day: IsoDate, days: number): IsoDate {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The Monday of the week `day` is in */
export function weekStart(day: IsoDate): IsoDate {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}

/** `trainedWeeks`: the Mondays of the weeks with training, in any order, duplicates allowed */
export function trainingStreak(
  trainedWeeks: readonly IsoDate[],
  today: IsoDate = todayInClub(),
): TrainingStreak {
  const weeks = new Set(trainedWeeks.map(weekStart));
  const thisMonday = weekStart(today);
  const thisWeek = weeks.has(thisMonday);

  let current = 0;
  for (let monday = thisWeek ? thisMonday : addDays(thisMonday, -7); weeks.has(monday); ) {
    current++;
    monday = addDays(monday, -7);
  }

  let best = 0;
  let run = 0;
  let previous: IsoDate | null = null;
  for (const monday of [...weeks].toSorted()) {
    run = previous !== null && addDays(previous, 7) === monday ? run + 1 : 1;
    best = Math.max(best, run);
    previous = monday;
  }
  return { current, best, thisWeek };
}
