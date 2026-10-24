import { RANK_IDS } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { css } from 'styled-system/css';
import { RankBadge } from './rank-badge';

const row = css({ display: 'flex', flexWrap: 'wrap', gap: '15' });

const meta: Meta<RankBadge> = {
  title: 'Display/Rank Badge',
  component: RankBadge,
  args: { rankId: 'goldenerPfeil' },
  argTypes: { rankId: { control: 'select', options: RANK_IDS } },
};
export default meta;

type Story = StoryObj<RankBadge>;

export const Default: Story = {};
/** Next to a line of text, as on the profile */
export const Inline: Story = { args: { size: 'inline' } };
export const All: Story = {
  render: () => ({
    props: { ranks: RANK_IDS, row },
    template: `
      <div [class]="row">
        @for (rank of ranks; track rank) {
          <app-rank-badge [rankId]="rank" />
        }
      </div>
    `,
  }),
};
