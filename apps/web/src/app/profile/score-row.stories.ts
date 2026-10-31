import type { Score } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { withRouter } from '../../../.storybook/decorators';
import { ScoreRow } from './score-row';

const score: Score = {
  id: '1',
  bowType: 'r',
  targetSize: 40,
  isSpot: true,
  shotOn: '2026-10-22',
  distance: 18,
  arrows: 30,
  tens: 12,
  nines: 9,
  result: 271,
  shots: null,
};

const meta: Meta<ScoreRow> = {
  title: 'Lists/Score Row',
  component: ScoreRow,
  decorators: [withRouter],
  args: { score, variant: 'history', rank: null, deletable: false },
  argTypes: { variant: { control: 'inline-radio', options: ['history', 'records'] } },
};
export default meta;

type Story = StoryObj<ScoreRow>;

export const History: Story = {};
/** On the user's own profile */
export const Deletable: Story = { args: { deletable: true } };
export const Record: Story = { args: { variant: 'records', rank: 1 } };
/** Saved offline, not uploaded yet: no link to its page */
export const Pending: Story = { args: { pending: true, deletable: true } };
