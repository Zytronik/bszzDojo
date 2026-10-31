import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  duelScoreLabel,
  duelSettingsLabel,
  CLUB_TIME_ZONE,
  otherSide,
  shownName,
  type DuelSummary,
} from '@bszz-dojo/shared';
import { css, cx } from 'styled-system/css';
import { duelRow, record } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faBolt, faChevronRight } from '../ui/icons';

/** A duel in a list (dashboard, profile), from the side of whose list it is. Opens the duel. */
@Component({
  selector: 'app-duel-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  host: { '[class]': 'styles.root' },
  template: `
    @if (invitation()) {
      <span [class]="iconStyles"><app-icon [icon]="icons.bolt" /></span>
    }
    <a [class]="styles.body" [routerLink]="['/duels', duel().id]">
      <p [class]="styles.title">
        @if (invitation()) {
          <strong>{{ rival() }}</strong> fordert dich heraus
        } @else {
          Gegen <strong>{{ rival() }}</strong>
        }
      </p>
      <p [class]="rowStyles.line">
        @if (state(); as state) {
          <span [class]="rowStyles.badge" [attr.data-tone]="tone()">{{ state }}</span> ·
        }
        {{ details() }}
      </p>
    </a>
    @if (score(); as score) {
      <p [class]="rowStyles.score" [attr.data-won]="duel().winner === duel().you || null">
        {{ score }}
      </p>
    }
    <app-icon [icon]="icons.open" [class]="openStyles" />
  `,
})
export class DuelRow {
  readonly duel = input.required<DuelSummary>();
  /** Whose list it is, to say "Du" or their name */
  readonly owner = input<'you' | 'them'>('you');

  protected readonly icons = { bolt: faBolt, open: faChevronRight };
  protected readonly styles = record();
  protected readonly rowStyles = duelRow();
  /** In the column the rankings show "#1" in, so the name lines up the same way */
  protected readonly iconStyles = cx(this.styles.rank, this.rowStyles.icon);
  protected readonly openStyles = css({ layerStyle: 'muted', fontSize: 'sm', flexShrink: '0' });

  protected readonly rival = computed(() => shownName(this.duel().rival));
  protected readonly invitation = computed(
    () => this.duel().status === 'invited' && this.duel().you === 'opponent',
  );
  protected readonly details = computed(() => {
    const duel = this.duel();
    const settings = duelSettingsLabel(duel);
    if (duel.status !== 'finished') return settings;
    const day = new Date(duel.updatedAt).toLocaleDateString('de-CH', {
      timeZone: CLUB_TIME_ZONE,
    });
    return `${settings} · ${day}`;
  });
  /** The viewer's turn stands out in the accent color */
  protected readonly tone = computed((): 'accent' | 'quiet' => {
    const duel = this.duel();
    return duel.yourTurn && this.owner() === 'you' ? 'accent' : 'quiet';
  });

  protected readonly score = computed((): string | null => {
    const duel = this.duel();
    if (duel.status !== 'active' && duel.status !== 'finished') return null;
    const me = duel.you;
    const them = otherSide(me);
    const label = (value: number): string => duelScoreLabel(duel.format, value);
    return `${label(duel.score[me])} : ${label(duel.score[them])}`;
  });

  protected readonly state = computed((): string => {
    const duel = this.duel();
    switch (duel.status) {
      case 'invited':
        return duel.you === 'opponent' ? 'Einladung' : 'Wartet auf Zusage';
      case 'active':
        return duel.yourTurn && this.owner() === 'you' ? 'Du bist dran' : 'Läuft';
      // The score's color says who won; the line has no room for it on phones.
      case 'finished':
        return '';
      default:
        return 'Beendet';
    }
  });
}
