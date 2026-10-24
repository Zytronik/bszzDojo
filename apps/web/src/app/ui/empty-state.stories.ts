import type { Meta, StoryObj } from '@storybook/angular-vite';
import { EmptyState } from './empty-state';

const meta: Meta<EmptyState & { text: string }> = {
  title: 'Feedback/Empty State',
  component: EmptyState,
  args: { text: 'Keine Rekorde vorhanden.' },
  render: (args) => ({
    props: args,
    template: `<app-empty-state>{{ text }}</app-empty-state>`,
  }),
};
export default meta;

export const Default: StoryObj<EmptyState & { text: string }> = {};
