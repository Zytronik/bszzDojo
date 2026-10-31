import type { Meta, StoryObj } from '@storybook/angular-vite';
import { DuelFacts } from './duel-facts';

const meta: Meta<DuelFacts> = {
  title: 'Duels/Facts',
  component: DuelFacts,
  args: {
    facts: [
      { label: 'Format', value: 'Satzsystem' },
      { label: 'Distanz', value: '18m' },
      { label: 'Deine Bogenart', value: 'Compound' },
      { label: 'Deine Scheibe', value: '40cm Spot' },
    ],
  },
};
export default meta;

type Story = StoryObj<DuelFacts>;

/** The challenger's own invitation */
export const Own: Story = {};
/** An invitation from someone else, with their bow type and face */
export const Received: Story = {
  args: {
    facts: [
      { label: 'Format', value: 'Gesamtpunkte' },
      { label: 'Distanz', value: '30m' },
      { label: 'Bogenart von Roli Wegmann', value: 'Traditionell' },
      { label: 'Scheibe von Roli Wegmann', value: '80cm' },
    ],
  },
};
