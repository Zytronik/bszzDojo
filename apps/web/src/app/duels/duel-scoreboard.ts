import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BOW_TYPES, duelFaceLabel, type DuelPlayer } from '@bszz-dojo/shared';
import { duel } from 'styled-system/recipes';
import { ShownNamePipe } from '../ui/shown-name.pipe';

/** The two archers with their bows and the score between them, the viewer on the left. */
@Component({
  selector: 'app-duel-scoreboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShownNamePipe],
  template: `
    <div [class]="styles.board">
      <div [class]="styles.player">
        <p [class]="styles.name">{{ left().name ?? (left().player | shownName) }}</p>
        <p [class]="styles.bow">{{ bowName(left().player) }}</p>
      </div>
      <p [class]="styles.score" [attr.aria-label]="'Stand ' + score().left + ' zu ' + score().right">
        {{ score().left }}<span [class]="styles.separator">:</span>{{ score().right }}
      </p>
      <div [class]="styles.player">
        <p [class]="styles.name">{{ right().player | shownName }}</p>
        <p [class]="styles.bow">{{ bowName(right().player) }}</p>
      </div>
      @if (caption()) {
        <p [class]="styles.caption">{{ caption() }}</p>
      }
    </div>
  `,
})
export class DuelScoreboard {
  /** `name` replaces the player's, e.g. "Du" */
  readonly left = input.required<{ player: DuelPlayer; name?: string }>();
  readonly right = input.required<{ player: DuelPlayer }>();
  readonly score = input.required<{ left: string; right: string }>();
  readonly caption = input('');

  protected readonly styles = duel();

  /** "Recurve · 40cm Spot" */
  protected bowName(player: DuelPlayer): string {
    if (!player.bowType) return 'Bogenart noch offen';
    const bow = BOW_TYPES[player.bowType].name;
    return player.face ? `${bow} · ${duelFaceLabel(player.face)}` : bow;
  }
}
