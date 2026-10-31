import { BOW_TYPE_IDS } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ArrowKeypad } from './arrow-keypad';

const meta: Meta<ArrowKeypad> = {
  title: 'Duels/Arrow Keypad',
  component: ArrowKeypad,
  args: { isSpot: false, bowType: 'r', disabled: false },
  argTypes: { bowType: { control: 'inline-radio', options: BOW_TYPE_IDS } },
};
export default meta;

type Story = StoryObj<ArrowKeypad>;

export const FullFace: Story = {};
/** A spot only has rings 6–10 */
export const Spot: Story = { args: { isSpot: true } };
/** Compound only gets 10 for the X, so there's no plain 10 */
export const Compound: Story = { args: { bowType: 'cp' } };
export const Disabled: Story = { args: { disabled: true } };
