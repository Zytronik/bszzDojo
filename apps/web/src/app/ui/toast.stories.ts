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
/** The service worker downloaded a new version; stays until it's used. */
export const Update: Story = {
  args: {
    toast: { id: 3, status: 'info', text: 'Eine neue Version ist verfügbar.' },
    action: 'Aktualisieren',
  },
};
export const InvalidForm: Story = {
  args: { toast: { id: 4, status: 'error', text: INVALID_FORM } },
};
/** A duel invitation that came in while the app was open; stays until it's opened. */
export const DuelInvitation: Story = {
  args: {
    toast: { id: 5, status: 'info', text: 'Roli Wegmann fordert dich zum Duell heraus.' },
    action: 'Ansehen',
  },
};
