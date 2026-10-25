import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { scoreSheet } from 'styled-system/recipes';

interface End {
  number: number;
  /** Indexes into `points` */
  slots: number[];
  total: number | null;
  runningTotal: number | null;
}

/** "X" for an inner 10, "M" for a miss, empty while the arrow isn't placed yet */
function label(points: number | null | undefined, inner: boolean): string {
  if (points === null || points === undefined) return '';
  if (inner) return 'X';
  return points === 0 ? 'M' : String(points);
}

/**
 * The scorecard: one row per end (Passe) of three or six arrows, its total and the running total. A
 * click selects an arrow, whose position the next tap on the target sets.
 */
@Component({
  selector: 'app-score-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table [class]="styles.table">
      <thead>
        <tr>
          <th [class]="styles.label" scope="col">Passe</th>
          @for (arrow of arrowNumbers(); track arrow) {
            <th [class]="styles.head" scope="col">{{ arrow }}</th>
          }
          <th [class]="styles.label" scope="col">Summe</th>
          <th [class]="styles.label" scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        @for (end of ends(); track end.number) {
          <tr>
            <th [class]="styles.cell" scope="row">{{ end.number }}</th>
            @for (slot of end.slots; track slot; let arrow = $index) {
              <td [class]="styles.cell">
                <button
                  type="button"
                  [class]="styles.shot"
                  [attr.aria-pressed]="slot === selected()"
                  [attr.aria-label]="
                    'Passe ' + end.number + ', Pfeil ' + (arrow + 1) + ': ' + (text(slot) || 'leer')
                  "
                  (click)="selected.set(slot)"
                >
                  {{ text(slot) }}
                </button>
              </td>
            }
            <td [class]="styles.total">{{ end.total ?? '' }}</td>
            <td [class]="styles.total">{{ end.runningTotal ?? '' }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class ScoreSheet {
  /** Per arrow, in the order shot: `null` while it isn't placed */
  readonly points = input.required<readonly (number | null)[]>();
  /** Per arrow, whether it's in the inner 10 */
  readonly inner = input<readonly boolean[]>([]);
  readonly selected = model<number | null>(null);

  protected readonly styles = scoreSheet();
  /** Arrows per end (`arrowsPerEnd`) */
  readonly perEnd = input.required<number>();
  protected readonly arrowNumbers = computed(() =>
    Array.from({ length: this.perEnd() }, (_, i) => i + 1),
  );

  protected readonly ends = computed((): End[] => {
    const points = this.points();
    const perEnd = this.perEnd();
    const ends: End[] = [];
    let running = 0;
    for (let start = 0; start < points.length; start += perEnd) {
      const slots = Array.from({ length: perEnd }, (_, i) => start + i);
      const placed = slots.map((slot) => points[slot]).filter((value) => value != null);
      const total = placed.length > 0 ? placed.reduce((sum, value) => sum + value, 0) : null;
      running += total ?? 0;
      ends.push({
        number: start / perEnd + 1,
        slots,
        total,
        runningTotal: total === null ? null : running,
      });
    }
    return ends;
  });

  protected text(slot: number): string {
    return label(this.points()[slot], this.inner()[slot] ?? false);
  }
}
