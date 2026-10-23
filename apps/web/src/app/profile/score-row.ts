import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BOW_TYPES, formatGermanDate, targetLabel, type Score } from '@bszz-dojo/shared';
import { record } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faDeleteLeft } from '../ui/icons';

/** `records`: a personal best with its place; `history`: with the distance. */
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
          {{ bowTypes[score().bowType].name }}: {{ score().arrows }}P. {{ score().distance }}m ({{
            targetLabel(score())
          }})
        } @else {
          {{ bowTypes[score().bowType].name }}: {{ score().arrows }} Pfeile ({{
            targetLabel(score())
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
  protected readonly formatDate = formatGermanDate;
  protected readonly bowTypes = BOW_TYPES;
  protected readonly targetLabel = targetLabel;
}
