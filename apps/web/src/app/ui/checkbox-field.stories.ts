import type { Meta, StoryObj } from '@storybook/angular-vite';
import { CheckboxField } from './checkbox-field';

const meta: Meta<CheckboxField> = {
  title: 'Forms/Checkbox',
  component: CheckboxField,
  args: { label: 'Spot:', checked: false },
};
export default meta;

type Story = StoryObj<CheckboxField>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
