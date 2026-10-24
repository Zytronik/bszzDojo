import type { Badge } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BadgeRow } from './badge-row';

const sm: Badge = {
  id: '1',
  kind: 'sm',
  place: 1,
  year: 2025,
  bowType: 'r',
  ageCategory: 'U21',
  tournamentType: 'indoor',
  location: 'Bern',
  eventName: null,
  team: true,
  distance: null,
};

const meta: Meta<BadgeRow> = {
  title: 'Lists/Badge Row',
  component: BadgeRow,
  args: { badge: sm, deletable: false },
};
export default meta;

type Story = StoryObj<BadgeRow>;

export const Sm: Story = {};
export const Clubturnier: Story = {
  args: {
    badge: {
      ...sm,
      kind: 'club',
      place: 2,
      eventName: 'Chlausschiessen',
      tournamentType: null,
      location: null,
      team: null,
      distance: 18,
    },
  },
};
/** Imported from the old app: only name, year and place */
export const Imported: Story = {
  args: {
    badge: {
      ...sm,
      kind: 'tournament',
      place: 3,
      eventName: 'Swiss Archery Cup',
      bowType: null,
      ageCategory: null,
      tournamentType: null,
      location: null,
      team: null,
    },
  },
};
export const Deletable: Story = { args: { deletable: true } };
