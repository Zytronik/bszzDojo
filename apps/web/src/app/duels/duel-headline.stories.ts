import type { Meta, StoryObj } from '@storybook/angular-vite';
import { DuelHeadline } from './duel-headline';

const meta: Meta<DuelHeadline> = {
  title: 'Duels/Headline',
  component: DuelHeadline,
  args: { tone: 'won', title: 'Gewonnen!', text: null },
  argTypes: { tone: { control: 'inline-radio', options: ['won', 'lost', 'waiting'] } },
};
export default meta;

type Story = StoryObj<DuelHeadline>;

export const Won: Story = {};
export const Lost: Story = { args: { tone: 'lost', title: 'Verloren' } };
/** The rival gave up */
export const WonByForfeit: Story = { args: { text: 'Bob de Tester hat aufgegeben.' } };
export const LostByForfeit: Story = {
  args: { tone: 'lost', title: 'Verloren', text: 'Du hast aufgegeben.' },
};
/** Someone else's duel: the winner's trophy */
export const Onlooker: Story = { args: { title: 'Bob de Tester gewinnt' } };
/** A sent invitation before its answer */
export const Waiting: Story = {
  args: {
    tone: 'waiting',
    title: 'Warte auf Bob de Tester',
    text: 'Sobald die Einladung angenommen ist, geht es los. Bis dahin findest du das Duell auf deiner Startseite.',
  },
};
