import type { ArcherySetup } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SetupDialog } from './setup-dialog';

const recurve: ArcherySetup = { bowType: 'r', distance: 18, targetSize: 40, isSpot: true };

const meta: Meta<SetupDialog> = {
  title: 'Scores/Setup Dialog',
  component: SetupDialog,
  // The backdrop covers the whole viewport, so each story gets its own frame in the docs.
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: '560px' } } },
  args: {
    open: true,
    current: recurve,
    recent: [
      recurve,
      { bowType: 'cp', distance: 18, targetSize: 40, isSpot: true },
      { bowType: 'bb', distance: 8, targetSize: 60, isSpot: false },
    ],
  },
};
export default meta;

type Story = StoryObj<SetupDialog>;

/** The recent setups are one tap each; the current one is outlined */
export const WithRecent: Story = {};
/** The first time: only the form */
export const FirstSetup: Story = { args: { current: null, recent: [] } };
