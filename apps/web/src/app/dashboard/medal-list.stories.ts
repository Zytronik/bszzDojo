import type { MedalStanding } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { withRouter } from '../../../.storybook/decorators';
import { MedalList } from './medal-list';

const standings: MedalStanding[] = [
  {
    rank: 1,
    username: 'robin_hood',
    displayName: 'Robin Hood',
    gold: 3,
    silver: 1,
    bronze: 0,
    points: 11,
  },
  { rank: 2, username: 'tell', displayName: null, gold: 1, silver: 2, bronze: 2, points: 9 },
];

const meta: Meta<MedalList> = {
  title: 'Lists/Medals',
  component: MedalList,
  decorators: [withRouter],
  args: { standings },
};
export default meta;

type Story = StoryObj<MedalList>;

export const Default: Story = {};
export const Empty: Story = { args: { standings: [] } };
