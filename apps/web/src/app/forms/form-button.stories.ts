import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FormButton } from './form-button';

const meta: Meta<FormButton & { label: string }> = {
  title: 'Forms/Button',
  component: FormButton,
  args: { label: 'Speichern', pending: false, disabled: false, tone: 'accent' },
  argTypes: { tone: { control: 'inline-radio', options: ['accent', 'neutral', 'subtle'] } },
  render: (args) => ({
    props: args,
    template: `
      <button type="button" appButton [pending]="pending" [disabled]="disabled" [tone]="tone">
        {{ label }}
      </button>
    `,
  }),
};
export default meta;

type Story = StoryObj<FormButton & { label: string }>;

export const Default: Story = {};
export const Pending: Story = { args: { pending: true } };
export const Disabled: Story = { args: { disabled: true } };
/** A second choice on the page, e.g. "Ablehnen" next to "Annehmen" */
export const Subtle: Story = { args: { tone: 'subtle', label: 'Ablehnen' } };
