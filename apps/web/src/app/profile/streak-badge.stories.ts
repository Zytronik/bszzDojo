import type { Meta, StoryObj } from '@storybook/angular-vite';
import { StreakBadge } from './streak-badge';

const meta: Meta<StreakBadge> = {
  title: 'Display/Streak Badge',
  component: StreakBadge,
  args: { streak: { current: 5, best: 8, thisWeek: true } },
};
export default meta;

type Story = StoryObj<StreakBadge>;

/** Trained this week: the flame is lit */
export const Done: Story = {};

/** Not yet this week: the streak still counts until Sunday, the flame is grey */
export const OpenThisWeek: Story = { args: { streak: { current: 4, best: 8, thisWeek: false } } };

export const NoStreak: Story = { args: { streak: { current: 0, best: 8, thisWeek: false } } };
