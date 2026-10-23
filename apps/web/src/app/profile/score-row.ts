import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Score } from '@bszz-dojo/shared';
import { record } from 'styled-system/recipes';
import { bowTypeName, formatDate, targetText } from '../core/score-labels';
import { Icon } from '../ui/icon';
import { faDeleteLeft } from '../ui/icons';

/**
 * A round in the profile: `records` (a personal best, with its place) or `history` (with the
 * distance, and a delete button on the user's own profile).
 */
@Component({
  selector: 'app-score-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  // The host is the row, so consecutive rows are siblings and the first one loses its top padding.
  host: { '[class]': 'styles.root' },
  template: `
    @if (rank(); as rank) {
      <p [class]="styles.rank">#{{ rank }}</p>
    }
    <div [class]="styles.body">
      <p [class]="styles.meta">{{ formatDate(score().shotOn) }}</p>
      <p [class]="styles.info">
        @if (variant() === 'history') {
          {{ bowTypeName(score().bowType) }}: {{ score().arrows }}P. {{ score().distance }}m ({{
            targetText(score())
          }})
        } @else {
          {{ bowTypeName(score().bowType) }}: {{ score().arrows }} Pfeile ({{
            targetText(score())
          }})
        }
      </p>
      <p [class]="styles.results">
        <span [class]="styles.highlight">{{ score().result }}</span>
        10er: <span [class]="styles.highlight">x{{ score().tens }}</span> 9er:
        <span [class]="styles.highlight">x{{ score().nines }}</span>
      </p>
    </div>
    @if (deletable()) {
      <div [class]="styles.actions">
        <button
          type="button"
          [class]="styles.action"
          aria-label="Eintrag löschen"
          (click)="deleted.emit()"
        >
          <app-icon [icon]="deleteIcon" />
        </button>
      </div>
    }
  `,
})
export class ScoreRow {
  readonly score = input.required<Score>();
  readonly variant = input<'records' | 'history'>('history');
  readonly rank = input<number | null>(null);
  readonly deletable = input(false);
  readonly deleted = output();

  protected readonly styles = record();
  protected readonly deleteIcon = faDeleteLeft;
  protected readonly formatDate = formatDate;
  protected readonly bowTypeName = bowTypeName;
  protected readonly targetText = targetText;
}
