import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FormButton } from './form-button';

const meta: Meta<FormButton & { label: string }> = {
  title: 'Forms/Button',
  component: FormButton,
  args: { label: 'Speichern', pending: false, disabled: false, size: 'block', tone: 'accent' },
  render: (args) => ({
    props: args,
    template: `<button type="button" appButton [pending]="pending" [disabled]="disabled" [size]="size" [tone]="tone">{{ label }}</button>`,
  }),
};
export default meta;

type Story = StoryObj<FormButton & { label: string }>;

export const Default: Story = {};
export const Pending: Story = { args: { pending: true } };
export const Disabled: Story = { args: { disabled: true } };
/** Next to other content, e.g. "Als Freund hinzufügen" on a profile */
export const Inline: Story = { args: { size: 'inline', label: 'Als Freund hinzufügen' } };
/** A secondary action, e.g. "Freund entfernen" */
export const Surface: Story = {
  args: { size: 'inline', tone: 'surface', label: 'Freund entfernen' },
};
