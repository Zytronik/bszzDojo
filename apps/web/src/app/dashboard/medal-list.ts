import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MedalStanding } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { medal, record } from 'styled-system/recipes';
import { EmptyState } from '../ui/empty-state';
import { ShownNamePipe } from '../ui/shown-name.pipe';

@Component({
  selector: 'app-medal-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Grows inside a LoadingFrame, so the empty state can fill it.
  host: { '[class]': 'hostStyles' },
  imports: [RouterLink, ShownNamePipe, EmptyState],
  template: `
    @for (standing of standings(); track standing.username) {
      <div [class]="styles.root">
        <p [class]="styles.rank">#{{ standing.rank }}</p>
        <div [class]="rowStyles">
          <a [routerLink]="['/profile', standing.username]" [class]="styles.title">
            {{ standing | shownName }}
          </a>
          <div [class]="medalsStyles">
            <p [class]="medalStyles.gold" [attr.aria-label]="standing.gold + ' Gold'">
              {{ standing.gold }}
            </p>
            <p [class]="medalStyles.silver" [attr.aria-label]="standing.silver + ' Silber'">
              {{ standing.silver }}
            </p>
            <p [class]="medalStyles.bronze" [attr.aria-label]="standing.bronze + ' Bronze'">
              {{ standing.bronze }}
            </p>
          </div>
        </div>
      </div>
    } @empty {
      <app-empty-state>Keine Auszeichnungen vorhanden.</app-empty-state>
    }
  `,
})
export class MedalList {
  protected readonly hostStyles = css({ flex: '1', display: 'flex', flexDir: 'column' });
  readonly standings = input.required<readonly MedalStanding[]>();

  protected readonly styles = record();
  protected readonly rowStyles = css({
    flex: '1',
    minW: '0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15',
  });
  protected readonly medalsStyles = css({ display: 'flex', gap: '15' });
  protected readonly medalStyles = {
    gold: medal({ tier: 'gold' }),
    silver: medal({ tier: 'silver' }),
    bronze: medal({ tier: 'bronze' }),
  };
}
