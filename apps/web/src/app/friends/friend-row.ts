import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Friend } from '@bszz-dojo/shared';
import { iconButton, record } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faHeart } from '../ui/icons';
import { RankBadge } from '../ui/rank-badge';
import { ShownNamePipe } from '../ui/shown-name.pipe';

/** A friend with their Abzeichen; the name opens their profile. */
@Component({
  selector: 'app-friend-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, RankBadge, ShownNamePipe],
  // The host is the row, so consecutive rows are siblings and the first one loses its top padding.
  host: { '[class]': 'styles.root' },
  template: `
    <a [class]="styles.body" [routerLink]="['/profile', friend().username]">
      <p [class]="styles.title">{{ friend() | shownName }}</p>
      @if (friend().displayName) {
        <p [class]="styles.meta">{{ friend().username }}</p>
      }
    </a>
    @if (friend().rank; as rank) {
      <app-rank-badge [rankId]="rank" size="inline" />
    }
    <div [class]="styles.actions">
      <button
        type="button"
        [class]="buttonStyles"
        aria-pressed="true"
        [attr.aria-label]="(friend() | shownName) + ' als Freund entfernen'"
        [disabled]="pending()"
        (click)="removed.emit()"
      >
        <app-icon [icon]="heartIcon" />
      </button>
    </div>
  `,
})
export class FriendRow {
  readonly friend = input.required<Friend>();
  /** While it's being removed */
  readonly pending = input(false);
  readonly removed = output();

  protected readonly styles = record();
  /** The full red heart, like on their profile */
  protected readonly buttonStyles = iconButton();
  protected readonly heartIcon = faHeart;
}
