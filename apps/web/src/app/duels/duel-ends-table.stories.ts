import type { Meta, StoryObj } from '@storybook/angular-vite';
import { DuelEndsTable } from './duel-ends-table';
import type { EndRow } from './duel-view';

const row = (label: string, mine: number, theirs: number, points: string | null): EndRow => ({
  label,
  mine: String(mine),
  theirs: String(theirs),
  myArrows: 'X 9 9',
  theirArrows: '9 9 9',
  myWeighted: null,
  theirWeighted: null,
  points,
  outcome: mine > theirs ? 1 : mine < theirs ? -1 : 0,
});

const meta: Meta<DuelEndsTable> = {
  title: 'Duels/Ends Table',
  component: DuelEndsTable,
  args: {
    rows: [row('1', 28, 27, '2 : 0'), row('2', 26, 28, '0 : 2'), row('3', 27, 27, '1 : 1')],
    endName: 'Satz',
    leftName: 'Du',
    rightName: 'Roli',
    hasPoints: true,
    detailed: false,
  },
};
export default meta;

type Story = StoryObj<DuelEndsTable>;

export const Sets: Story = {};
/** After the duel: every arrow under the totals */
export const Detailed: Story = { args: { detailed: true } };
/** Different bows: the totals with the factor under them */
export const WithFactor: Story = {
  args: {
    endName: 'Passe',
    hasPoints: false,
    rows: [
      { ...row('1', 27, 25, null), myWeighted: '27', theirWeighted: '28', outcome: -1 },
      { ...row('2', 29, 26, null), myWeighted: '29', theirWeighted: '29', outcome: 1 },
    ],
  },
};
