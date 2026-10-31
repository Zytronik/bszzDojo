import type { Meta, StoryObj } from '@storybook/angular-vite';
import { DuelWaiting } from './duel-waiting';

const meta: Meta<DuelWaiting> = {
  title: 'Duels/Waiting',
  component: DuelWaiting,
  args: { rival: 'Bob de Tester' },
};
export default meta;

type Story = StoryObj<DuelWaiting>;

export const Default: Story = {};
/** A long name wraps under the hourglass */
export const LongName: Story = { args: { rival: 'Maximilian von Hohenberg-Steinach' } };
