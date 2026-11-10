import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SetupBar } from './setup-bar';

const meta: Meta<SetupBar> = {
  title: 'Scores/Setup Bar',
  component: SetupBar,
  args: { setup: { bowType: 'r', distance: 18, targetSize: 40, isSpot: true } },
};
export default meta;

type Story = StoryObj<SetupBar>;

export const Default: Story = {};
/** Before the first round or pick */
export const WithoutSetup: Story = { args: { setup: null } };
/** Once arrows are placed on the target, the round's setup stays */
export const Locked: Story = { args: { disabled: true } };
