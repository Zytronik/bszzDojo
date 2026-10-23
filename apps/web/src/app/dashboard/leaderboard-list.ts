import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LeaderboardEntry } from '@bszz-dojo/shared';
import { record } from 'styled-system/recipes';
import { ShownNamePipe } from '../ui/shown-name.pipe';
import { bowTypeName, formatDate, targetText } from '../core/score-labels';

@Component({
  selector: 'app-leaderboard-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ShownNamePipe],
  template: `
    @for (entry of entries(); track entry.username) {
      <div [class]="styles.root">
        <p [class]="styles.rank">#{{ entry.rank }}</p>
        <div [class]="styles.body">
          <a [routerLink]="['/profile', entry.username]" [class]="styles.title">{{
            entry | shownName
          }}</a>
          <p [class]="styles.results">
            <span [class]="styles.highlight">{{ entry.adjustedResult }}</span> ({{ entry.result }})
            10er: <span [class]="styles.highlight">x{{ entry.tens }}</span> 9er:
            <span [class]="styles.highlight">x{{ entry.nines }}</span>
          </p>
          <p [class]="styles.meta">{{ formatDate(entry.shotOn) }}</p>
          <p [class]="styles.meta">{{ bowTypeName(entry.bowType) }}: ({{ targetText(entry) }})</p>
        </div>
      </div>
    } @empty {
      <p>Keine Rekorde vorhanden.</p>
    }
  `,
})
export class LeaderboardList {
  readonly entries = input.required<readonly LeaderboardEntry[]>();

  protected readonly styles = record();
  protected readonly formatDate = formatDate;
  protected readonly bowTypeName = bowTypeName;
  protected readonly targetText = targetText;
}
