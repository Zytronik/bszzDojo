import type { TrainingStreak } from '@bszz-dojo/shared';

export class TrainingStreakResponse implements TrainingStreak {
  /** Weeks in a row with training, up to this week, or last week while this one has none yet */
  current: number;

  /** The longest streak so far */
  best: number;

  /** Trained this week already (Monday to Sunday, Europe/Zurich) */
  thisWeek: boolean;

  /** The last 8 weeks, oldest first, this week last: trained or not */
  recent: boolean[];
}
