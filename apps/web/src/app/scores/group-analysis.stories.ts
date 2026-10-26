import type { Meta, StoryObj } from '@storybook/angular-vite';
import { GroupAnalysis } from './group-analysis';

const meta: Meta<GroupAnalysis> = {
  title: 'Scores/Group Analysis',
  component: GroupAnalysis,
  args: {
    group: {
      center: { x: 0.11, y: -0.08 },
      halfRadius: 0.12,
      area: { left: -0.02, top: -0.3, right: 0.25, bottom: 0.12 },
      areaShots: 27,
    },
    shots: 30,
    targetSize: 60,
    isSpot: false,
  },
};
export default meta;

type Story = StoryObj<GroupAnalysis>;

/** Off center: with a hint for the sight */
export const OffCenter: Story = {};
/** Centered and round, few arrows: no hint, no shape, all counted */
export const Centered: Story = {
  args: {
    group: {
      center: { x: 0.02, y: 0.01 },
      halfRadius: 0.1,
      area: { left: -0.13, top: -0.15, right: 0.17, bottom: 0.16 },
      areaShots: 6,
    },
    shots: 6,
  },
};
