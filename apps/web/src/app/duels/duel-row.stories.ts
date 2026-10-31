import type { DuelSummary } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { withRouter } from '../../../.storybook/decorators';
import { DuelRow } from './duel-row';

const duel: DuelSummary = {
  id: '1',
  status: 'active',
  you: 'challenger',
  rival: { username: 'roli', displayName: 'Roli Wegmann' },
  format: 'sets',
  distance: 18,
  score: { challenger: 4, opponent: 2 },
  yourTurn: true,
  winner: null,
  updatedAt: '2026-10-29T15:00:00.000Z',
};

const meta: Meta<DuelRow> = {
  title: 'Lists/Duel Row',
  component: DuelRow,
  decorators: [withRouter],
  args: { duel, owner: 'you' },
};
export default meta;

type Story = StoryObj<DuelRow>;

export const Active: Story = {};
/** On someone else's profile: their turn isn't the viewer's */
export const OnTheirProfile: Story = { args: { owner: 'them' } };
export const Invitation: Story = {
  args: { duel: { ...duel, status: 'invited', you: 'opponent', yourTurn: true } },
};
export const Waiting: Story = {
  args: {
    duel: { ...duel, status: 'invited', score: { challenger: 0, opponent: 0 }, yourTurn: false },
  },
};
export const Won: Story = {
  args: {
    duel: {
      ...duel,
      status: 'finished',
      score: { challenger: 6, opponent: 2 },
      yourTurn: false,
      winner: 'challenger',
    },
  },
};
export const Lost: Story = {
  args: {
    duel: {
      ...duel,
      status: 'finished',
      score: { challenger: 4, opponent: 6 },
      yourTurn: false,
      winner: 'opponent',
    },
  },
};
/** Totals with the factor, rounded down: the widest score a row shows */
export const TotalWon: Story = {
  args: {
    duel: {
      ...duel,
      status: 'finished',
      format: 'total',
      score: { challenger: 12900, opponent: 10404 },
      yourTurn: false,
      winner: 'challenger',
    },
  },
};
