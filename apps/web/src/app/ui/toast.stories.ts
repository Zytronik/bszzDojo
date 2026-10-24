import type { Meta, StoryObj } from '@storybook/angular-vite';
import { INVALID_FORM } from '../forms/validators';
import { ToastMessage } from './toast';

const meta: Meta<ToastMessage> = {
  title: 'Feedback/Toast',
  component: ToastMessage,
  args: { toast: { id: 1, status: 'success', text: 'Score erfolgreich eingetragen.' } },
};
export default meta;

type Story = StoryObj<ToastMessage>;

export const Success: Story = {};
export const Error: Story = {
  args: { toast: { id: 2, status: 'error', text: 'Benutzername oder Passwort ist falsch.' } },
};
export const InvalidForm: Story = {
  args: { toast: { id: 3, status: 'error', text: INVALID_FORM } },
};
