import type { Meta, StoryObj } from '@storybook/angular-vite';
import { InstallSteps } from './install-steps';

const meta: Meta<InstallSteps> = {
  title: 'Display/Install Steps',
  component: InstallSteps,
  args: { platform: 'ios' },
  argTypes: { platform: { control: 'inline-radio', options: ['ios', 'android'] } },
};
export default meta;

type Story = StoryObj<InstallSteps>;

export const Ios: Story = {};
export const Android: Story = { args: { platform: 'android' } };
