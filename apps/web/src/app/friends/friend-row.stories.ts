import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import type { Friend } from '@bszz-dojo/shared';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FriendRow } from './friend-row';

const friend: Friend = { username: 'robin_hood', displayName: 'Robin Hood', rank: 'goldenerPfeil' };

const meta: Meta<FriendRow> = {
  title: 'Lists/Friend Row',
  component: FriendRow,
  decorators: [
    applicationConfig({ providers: [provideRouter([], withDisabledInitialNavigation())] }),
  ],
  args: { friend, pending: false },
};
export default meta;

type Story = StoryObj<FriendRow>;

export const WithDisplayName: Story = {};
/** Without display name or Abzeichen */
export const UsernameOnly: Story = {
  args: { friend: { username: 'wilhelm.tell', displayName: null, rank: null } },
};
/** While it's being removed */
export const Pending: Story = { args: { pending: true } };
