import type { Meta, StoryObj } from '@storybook/angular-vite';
import { StreakLine } from './streak-line';

const meta: Meta<StreakLine> = {
  title: 'Display/Streak Line',
  component: StreakLine,
  args: { streak: { current: 5, best: 5, thisWeek: true } },
};
export default meta;

type Story = StoryObj<StreakLine>;

/** Trained this week, the streak is the record: the flame is lit, no record shown */
export const Done: Story = {};

/** Not yet this week: the streak still counts until Sunday, the flame is grey */
export const OpenThisWeek: Story = { args: { streak: { current: 1, best: 4, thisWeek: false } } };

export const NoStreak: Story = { args: { streak: { current: 0, best: 4, thisWeek: false } } };
