import type { Meta, StoryObj } from '@storybook/angular-vite';
import { withHttp } from '../../../.storybook/decorators';
import { SetupPicker } from './setup-picker';

/** Reads and saves the setup through `SettingsStore`; without a logged-in user it starts empty. */
const meta: Meta<SetupPicker> = {
  title: 'Scores/Setup Picker',
  component: SetupPicker,
  decorators: [withHttp],
};
export default meta;

type Story = StoryObj<SetupPicker>;

export const Default: Story = {};
export const Locked: Story = { args: { disabled: true } };
