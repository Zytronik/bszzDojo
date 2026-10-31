import type { DuelPlayer } from '@bszz-dojo/shared';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { DuelScoreboard } from './duel-scoreboard';

const player = (displayName: string, bowType: DuelPlayer['bowType']): DuelPlayer => ({
  username: displayName.toLowerCase(),
  displayName,
  bowType,
  face: bowType ? { targetSize: 40, isSpot: false } : null,
  ends: [],
  shootOffs: [],
  ahead: false,
});

const meta: Meta<DuelScoreboard> = {
  title: 'Duels/Scoreboard',
  component: DuelScoreboard,
  args: {
    left: { player: player('Omar', 'r'), name: 'Du' },
    right: { player: player('Roli Wegmann', 'r') },
    score: { left: '4', right: '2' },
    caption: 'Satz 4 · zuerst 6 Satzpunkte',
  },
};
export default meta;

type Story = StoryObj<DuelScoreboard>;

export const Sets: Story = {};
/** Different bows: totals with the factor */
export const TotalWithFactor: Story = {
  args: {
    right: { player: player('Roli Wegmann', 'bb') },
    score: { left: '183', right: '186' },
    caption: 'Passe 3 von 5 · mit Faktor',
  },
};
/** The opponent hasn't accepted yet */
export const Invited: Story = {
  args: { right: { player: player('Roli Wegmann', null) }, score: { left: '0', right: '0' } },
};
