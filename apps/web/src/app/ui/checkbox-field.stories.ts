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
/** A setting on its own, e.g. the theme */
export const Inline: Story = { args: { layout: 'inline' } };
/** Like the target mode's setup once an arrow is placed */
export const Disabled: Story = { args: { checked: true, disabled: true } };
