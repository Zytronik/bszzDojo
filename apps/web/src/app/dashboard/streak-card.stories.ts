import type { TrainingStreak } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { StreakCard } from './streak-card';

const streak: TrainingStreak = {
  current: 5,
  best: 8,
  thisWeek: true,
  recent: [false, false, false, true, true, true, true, true],
};

const meta: Meta<StreakCard> = {
  title: 'Display/Streak Card',
  component: StreakCard,
  args: { streak },
};
export default meta;

type Story = StoryObj<StreakCard>;

/** Trained this week: the flame is lit */
export const Done: Story = {};

/** Trained last week, not yet this week: the streak still counts until Sunday */
export const OpenThisWeek: Story = {
  args: {
    streak: {
      current: 4,
      best: 8,
      thisWeek: false,
      recent: [false, false, false, true, true, true, true, false],
    },
  },
};

/** The streak broke; the record stays */
export const Broken: Story = {
  args: {
    streak: {
      current: 0,
      best: 8,
      thisWeek: false,
      recent: [true, true, true, false, false, true, false, false],
    },
  },
};

/** No training recorded yet */
export const First: Story = {
  args: { streak: { current: 0, best: 0, thisWeek: false, recent: Array(8).fill(false) } },
};
