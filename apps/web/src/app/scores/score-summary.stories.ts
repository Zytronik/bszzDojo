import type { ScoreDetail } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ScoreSummary } from './score-summary';

const score: ScoreDetail = {
  id: '1',
  username: 'robin_hood',
  displayName: 'Robin Hood',
  bowType: 'r',
  targetSize: 60,
  isSpot: false,
  shotOn: '2026-10-24',
  distance: 18,
  arrows: 30,
  tens: 6,
  nines: 15,
  result: 256,
  shots: [
    { x: 0, y: 0.01 },
    { x: 0.3, y: 0.2 },
    { x: 1.2, y: 0 },
  ],
  comparison: { rounds: 12, average: 231, best: 268 },
};

const meta: Meta<ScoreSummary> = {
  title: 'Scores/Score Summary',
  component: ScoreSummary,
  args: { score },
};
export default meta;

type Story = StoryObj<ScoreSummary>;

export const AboveAverage: Story = {};
export const PersonalBest: Story = {
  args: { score: { ...score, comparison: { rounds: 12, average: 231, best: 250 } } },
};
export const FirstRound: Story = {
  args: { score: { ...score, comparison: { rounds: 0, average: null, best: null } } },
};
/** Saved offline, not uploaded yet */
export const Pending: Story = {
  args: {
    score: { ...score, comparison: { rounds: 0, average: null, best: null } },
    pending: true,
  },
};
/** Entered as totals only: no X or misses */
export const WithoutShots: Story = {
  args: { score: { ...score, shots: null, result: 220 } },
};
