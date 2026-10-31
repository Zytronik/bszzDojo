import type { Meta, StoryObj } from '@storybook/angular-vite';
import { OTHER_END_COLOR, PICKED_END_COLOR, TargetCanvas } from './target-canvas';

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
/** A saved round: zoomed to the arrows, with the mean point of impact and its circle. */
export const Saved: Story = {
  args: {
    interactive: false,
    selected: null,
    group: {
      center: { x: -0.05, y: 0.07 },
      halfRadius: 0.16,
      area: { left: -0.3, top: -0.04, right: 0.14, bottom: 0.2 },
      areaShots: 3,
    },
  },
};
/** One end picked out */
export const OneEnd: Story = {
  args: {
    interactive: false,
    selected: null,
    shotColors: [PICKED_END_COLOR, OTHER_END_COLOR, OTHER_END_COLOR],
  },
};
