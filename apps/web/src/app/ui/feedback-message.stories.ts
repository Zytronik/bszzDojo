import type { Meta, StoryObj } from '@storybook/angular-vite';
import { failure, success } from '../core/feedback';
import { INVALID_FORM } from '../forms/validators';
import { FeedbackMessage } from './feedback-message';

const meta: Meta<FeedbackMessage> = {
  title: 'Feedback/Message',
  component: FeedbackMessage,
};
export default meta;

type Story = StoryObj<FeedbackMessage>;

export const Success: Story = { args: { feedback: success('Score erfolgreich eingetragen.') } };
export const Error: Story = {
  args: { feedback: failure('Benutzername oder Passwort ist falsch.') },
};
export const InvalidForm: Story = { args: { feedback: INVALID_FORM } };
