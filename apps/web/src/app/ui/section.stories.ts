import type { Meta, StoryObj } from '@storybook/angular-vite';
import { Section } from './section';

const meta: Meta<Section> = {
  title: 'Layout/Section',
  component: Section,
  render: () => ({
    template: `
      <app-section>
        <h2>Rekorde</h2>
        <p>The centered column every page section sits in, with its vertical padding.</p>
      </app-section>
    `,
  }),
};
export default meta;

export const Default: StoryObj<Section> = {};
