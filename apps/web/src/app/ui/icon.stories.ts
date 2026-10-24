import type { Meta, StoryObj } from '@storybook/angular-vite';
import { css } from 'styled-system/css';
import { Icon } from './icon';
import * as icons from './icons';

const row = css({ display: 'flex', flexWrap: 'wrap', gap: '25', fontSize: 'headerIcon' });

const meta: Meta<Icon> = {
  title: 'Display/Icon',
  component: Icon,
  args: { icon: icons.faGear, label: '' },
  argTypes: { icon: { control: false } },
};
export default meta;

type Story = StoryObj<Icon>;

export const Default: Story = {};
/** Everything re-exported from `ui/icons.ts` */
export const All: Story = {
  render: () => ({
    props: { icons: Object.entries(icons), row },
    template: `
      <div [class]="row">
        @for (entry of icons; track entry[0]) {
          <app-icon [icon]="entry[1]" [label]="entry[0]" />
        }
      </div>
    `,
  }),
};
