import type { Meta, StoryObj } from '@storybook/angular-vite';
import { sharedScore } from './share-card.stories';
import { ShareDialog } from './share-dialog';

const meta: Meta<ShareDialog> = {
  title: 'Scores/Share Dialog',
  component: ShareDialog,
  args: { open: true, score: sharedScore },
};
export default meta;

type Story = StoryObj<ShareDialog>;

/** "Bild teilen" waits for the image; without a share sheet it says "Bild speichern" */
export const Open: Story = {};
