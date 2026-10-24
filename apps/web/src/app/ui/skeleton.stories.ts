import type { Meta, StoryObj } from '@storybook/angular-vite';
import { Skeleton } from './skeleton';

const meta: Meta<Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  args: { lines: 2, rank: false, chart: false, ghost: false },
  argTypes: { lines: { control: 'inline-radio', options: [1, 2, 3] } },
};
export default meta;

type Story = StoryObj<Skeleton>;

export const List: Story = {};
/** Leaderboards and records */
export const WithRank: Story = { args: { rank: true, lines: 3 } };
/** The progress chart */
export const Chart: Story = { args: { chart: true } };
