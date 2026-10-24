import type { Meta, StoryObj } from '@storybook/angular-vite';
import { Tabs } from './tabs';

const meta: Meta<Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  args: {
    tabs: [
      { id: '18', label: '18m' },
      { id: '8', label: '8m' },
    ],
    selected: '18',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-tabs [tabs]="tabs" [(selected)]="selected">
        <p>Inhalt für {{ selected }}m</p>
      </app-tabs>
    `,
  }),
};
export default meta;

export const Default: StoryObj<Tabs> = {};
