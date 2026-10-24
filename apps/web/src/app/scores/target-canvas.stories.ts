import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TargetCanvas } from './target-canvas';

const meta: Meta<TargetCanvas> = {
  title: 'Scores/Target',
  component: TargetCanvas,
  args: {
    shots: [
      { x: 0.02, y: -0.04 },
      { x: 0.14, y: 0.05 },
      { x: -0.3, y: 0.2 },
    ],
    selected: 1,
    isSpot: false,
  },
};
export default meta;

type Story = StoryObj<TargetCanvas>;

export const FullFace: Story = {};
/** Only rings 6–10; the same positions score differently. */
export const Spot: Story = { args: { isSpot: true } };
