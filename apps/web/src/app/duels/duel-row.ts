import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  duelScoreLabel,
  duelSettingsLabel,
  formatGermanDate,
  otherSide,
  shownName,
  type DuelSummary,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { record } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faBolt, faChevronRight } from '../ui/icons';

/** A duel in a list (dashboard, profile), from the side of whose list it is. Opens the duel. */
@Component({
  selector: 'app-duel-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  host: { '[class]': 'styles.root' },
  template: `
    <a [class]="styles.body" [routerLink]="['/duels', duel().id]">
      <p [class]="styles.title">
        @if (duel().status === 'invited' && duel().you === 'opponent') {
          <app-icon [icon]="icons.bolt" />
          <strong>{{ rival() }}</strong> fordert dich heraus
        } @else {
          Gegen <strong>{{ rival() }}</strong>
        }
      </p>
      <p [class]="styles.meta">{{ state() }} · {{ settings() }}</p>
    </a>
    @if (score(); as score) {
      <p [class]="scoreStyles">{{ score }}</p>
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
  protected readonly scoreStyles = css({ fontSize: 'xl', fontWeight: 'bold', flexShrink: '0' });
  protected readonly openStyles = css({ layerStyle: 'muted', fontSize: 'sm', flexShrink: '0' });

  protected readonly rival = computed(() => shownName(this.duel().rival));
  protected readonly settings = computed(() => duelSettingsLabel(this.duel()));

  protected readonly score = computed((): string | null => {
    const duel = this.duel();
    if (duel.status !== 'active' && duel.status !== 'finished') return null;
    const me = duel.you;
    const them = otherSide(me);
    const label = (value: number): string => duelScoreLabel(duel.format, value);
    return `${label(duel.score[me])}:${label(duel.score[them])}`;
  });

  protected readonly state = computed((): string => {
    const duel = this.duel();
    switch (duel.status) {
      case 'invited':
        return duel.you === 'opponent' ? 'Einladung' : 'Wartet auf Zusage';
      case 'active':
        return duel.yourTurn && this.owner() === 'you' ? 'Du bist dran' : 'Läuft';
      case 'finished': {
        const day = formatGermanDate(duel.updatedAt).split(', ')[1] ?? '';
        return `${duel.winner === duel.you ? 'Sieg' : 'Niederlage'} · ${day}`;
      }
      default:
        return 'Beendet';
    }
  });
}
