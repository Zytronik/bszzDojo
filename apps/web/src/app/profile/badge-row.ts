import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { badgeDetails, badgeTitle, type Badge } from '@bszz-dojo/shared';
import { record } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faDeleteLeft } from '../ui/icons';

/**
 * A placing as the old app showed it ("#1 Chlausschiessen 2023"), with its details below and,
 * in the settings, a delete button.
 */
@Component({
  selector: 'app-badge-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { '[class]': 'styles.root' },
  template: `
    <div [class]="styles.body">
      <p>
        <span [class]="styles.highlight">#{{ badge().place }}</span> {{ title() }}
        {{ badge().year }}
      </p>
      @if (details()) {
        <p [class]="styles.meta">{{ details() }}</p>
      }
    </div>
    @if (deletable()) {
      <div [class]="styles.actions">
        <button
          type="button"
          [class]="styles.action"
          [attr.aria-label]="title() + ' ' + badge().year + ' löschen'"
          (click)="deleted.emit()"
        >
          <app-icon [icon]="deleteIcon" />
        </button>
      </div>
    }
  `,
})
export class BadgeRow {
  readonly badge = input.required<Badge>();
  readonly deletable = input(false);
  readonly deleted = output();

  protected readonly title = computed(() => badgeTitle(this.badge()));
  protected readonly details = computed(() => badgeDetails(this.badge()));
  protected readonly styles = record();
  protected readonly deleteIcon = faDeleteLeft;
}
