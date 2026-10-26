import type { Meta, StoryObj } from '@storybook/angular-vite';
import { Skeleton } from './skeleton';

const meta: Meta<Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  args: { shape: 'rows', lines: 2, rank: false, ghost: false },
  argTypes: {
    shape: {
      control: 'select',
      options: ['rows', 'chart', 'bars', 'heading', 'summary', 'target'],
    },
    lines: { control: 'inline-radio', options: [1, 2, 3] },
  },
};
export default meta;

type Story = StoryObj<Skeleton>;

export const List: Story = {};
/** Leaderboards and records */
export const WithRank: Story = { args: { rank: true, lines: 3 } };
/** The progress chart with its distance tabs */
export const Chart: Story = { args: { shape: 'chart' } };
/** A chart without tabs (the score page's end totals and ring distribution) */
export const Bars: Story = { args: { shape: 'bars' } };
/** The score page's title with its back button */
export const Heading: Story = { args: { shape: 'heading' } };
/** A round's result and its figures */
export const Summary: Story = { args: { shape: 'summary' } };
/** The target with the group analysis */
export const Target: Story = { args: { shape: 'target' } };
