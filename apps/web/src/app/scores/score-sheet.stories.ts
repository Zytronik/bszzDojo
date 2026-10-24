import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ScoreSheet } from './score-sheet';

const meta: Meta<ScoreSheet> = {
  title: 'Scores/Score Sheet',
  component: ScoreSheet,
  args: { points: [10, 9, 8, 5, 10, 0, null, null, null], selected: 6 },
};
export default meta;

type Story = StoryObj<ScoreSheet>;

/** Two ends shot, the next arrow selected */
export const InProgress: Story = {};
export const Empty: Story = {
  args: { points: Array.from({ length: 9 }, () => null), selected: 0 },
};
export const Complete: Story = {
  args: { points: [10, 10, 9, 9, 9, 8, 10, 7, 6], selected: null },
};
