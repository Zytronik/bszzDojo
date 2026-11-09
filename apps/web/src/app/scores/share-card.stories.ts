import type { ScoreDetail, Shot } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ShareCard } from './share-card';

/** 30 arrows spread around a point right of the center, the same on every render */
const shots: Shot[] = Array.from({ length: 30 }, (_, index) => {
  const angle = index * 2.4;
  const distance = 0.04 + ((index * 7) % 11) * 0.025;
  return { x: 0.08 + Math.cos(angle) * distance, y: Math.sin(angle) * distance };
});

export const sharedScore: ScoreDetail = {
  id: '1',
  username: 'robin_hood',
  displayName: 'Robin Hood',
  bowType: 'r',
  targetSize: 60,
  isSpot: false,
  shotOn: '2026-11-01',
  distance: 18,
  arrows: 30,
  tens: 9,
  nines: 12,
  result: 266,
  shots,
  comparison: { rounds: 12, average: 231, best: 258 },
};

const meta: Meta<ShareCard> = {
  title: 'Scores/Share Card',
  component: ShareCard,
  // The share dialog's stories use the same round.
  excludeStories: ['sharedScore'],
  args: { score: sharedScore },
};
export default meta;

type Story = StoryObj<ShareCard>;

/** A personal best, shot on the target */
export const PersonalBest: Story = {};
export const WithoutRecord: Story = {
  args: { score: { ...sharedScore, comparison: { rounds: 12, average: 231, best: 280 } } },
};
/** Entered as totals only: the face without arrows */
export const WithoutShots: Story = {
  args: { score: { ...sharedScore, shots: null } },
};
/** A miss: next to the face, which keeps its size */
export const WithMiss: Story = {
  args: { score: { ...sharedScore, shots: [...shots.slice(1), { x: -1.1, y: 0.2 }] } },
};
export const Spot: Story = {
  args: { score: { ...sharedScore, isSpot: true, targetSize: 40, displayName: null } },
};
