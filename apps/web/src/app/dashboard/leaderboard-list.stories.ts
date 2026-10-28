import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import type { LeaderboardEntry } from '@bszz-dojo/shared';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { LeaderboardList } from './leaderboard-list';

const entries: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'robin_hood',
    displayName: 'Robin Hood',
    adjustedResult: 294,
    result: 288,
    tens: 18,
    nines: 12,
    bowType: 'r',
    targetSize: 40,
    isSpot: true,
    shotOn: '2026-10-12',
  },
  {
    rank: 2,
    username: 'tell',
    displayName: null,
    adjustedResult: 281,
    result: 251,
    tens: 9,
    nines: 11,
    bowType: 'lb',
    targetSize: 60,
    isSpot: false,
    shotOn: '2026-09-30',
  },
];

const meta: Meta<LeaderboardList> = {
  title: 'Lists/Leaderboard',
  component: LeaderboardList,
  decorators: [
    applicationConfig({ providers: [provideRouter([], withDisabledInitialNavigation())] }),
  ],
  args: { entries },
};
export default meta;

type Story = StoryObj<LeaderboardList>;

export const Default: Story = {};
export const Empty: Story = { args: { entries: [] } };
/** The user's round saved offline, shown before its upload */
export const WithPending: Story = {
  args: {
    entries: entries.map((entry, index) => (index === 0 ? { ...entry, pending: true } : entry)),
  },
};
