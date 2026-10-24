import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ConfirmDialog } from './confirm-dialog';

const meta: Meta<ConfirmDialog> = {
  title: 'Overlays/Confirm Dialog',
  component: ConfirmDialog,
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: '260px' } } },
  args: {
    open: true,
    message: 'Bist du sicher, dass du den Eintrag löschen möchtest?',
    pending: false,
  },
};
export default meta;

type Story = StoryObj<ConfirmDialog>;

export const Default: Story = {};
export const Pending: Story = { args: { pending: true } };
