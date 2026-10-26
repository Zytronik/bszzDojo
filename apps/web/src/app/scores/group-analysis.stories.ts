import type { Meta, StoryObj } from '@storybook/angular-vite';
import { GroupAnalysis } from './group-analysis';

const meta: Meta<GroupAnalysis> = {
  title: 'Scores/Group Analysis',
  component: GroupAnalysis,
  args: {
    group: { center: { x: 0.11, y: -0.08 }, halfRadius: 0.12, width: 0.27, height: 0.36 },
    targetSize: 60,
    isSpot: false,
  },
};
export default meta;

type Story = StoryObj<GroupAnalysis>;

/** Off center: with a hint for the sight */
export const OffCenter: Story = {};
/** Centered and round: no hint, no shape */
export const Centered: Story = {
  args: { group: { center: { x: 0.02, y: 0.01 }, halfRadius: 0.1, width: 0.3, height: 0.31 } },
};
