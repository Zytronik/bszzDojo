import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BOW_TYPES, formatGermanDate, targetLabel, type LeaderboardEntry } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { record } from 'styled-system/recipes';
import { EmptyState } from '../ui/empty-state';
import { ShownNamePipe } from '../ui/shown-name.pipe';

@Component({
  selector: 'app-leaderboard-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostStyles' },
  imports: [RouterLink, ShownNamePipe, EmptyState],
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
          <p [class]="styles.meta">
            {{ bowTypes[entry.bowType].name }}: ({{ targetLabel(entry) }})
          </p>
        </div>
      </div>
    } @empty {
      <app-empty-state>Keine Rekorde vorhanden.</app-empty-state>
    }
  `,
})
export class LeaderboardList {
  protected readonly hostStyles = css({ flex: '1', display: 'flex', flexDir: 'column' });
  readonly entries = input.required<readonly LeaderboardEntry[]>();

  protected readonly styles = record();
  protected readonly formatDate = formatGermanDate;
  protected readonly bowTypes = BOW_TYPES;
  protected readonly targetLabel = targetLabel;
}
