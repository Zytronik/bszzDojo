import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { card, duel } from 'styled-system/recipes';
import { cx } from 'styled-system/css';
import type { EndRow } from './duel-view';

/**
 * Every end both have shot: the totals (with the factor when the bows differ), the arrows when
 * `detailed`, and in the set system the set points.
 */
@Component({
  selector: 'app-duel-ends-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardStyles">
      <table [class]="styles.table">
        <thead>
          <tr>
            <th scope="col">{{ endName() }}</th>
            <th scope="col">{{ leftName() }}</th>
            <th scope="col">{{ rightName() }}</th>
            @if (hasPoints()) {
              <th scope="col">Punkte</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.label) {
            <tr>
              <td>{{ row.label }}</td>
              <td [class]="row.outcome > 0 ? styles.won : ''">
                {{ row.mine }}
                @if (detailed() && row.myArrows) {
                  <small>{{ row.myArrows }}</small>
                }
                @if (row.myWeighted) {
                  <small>{{ row.myWeighted }}</small>
                }
              </td>
              <td [class]="row.outcome < 0 ? styles.won : ''">
                {{ row.theirs }}
                @if (detailed() && row.theirArrows) {
                  <small>{{ row.theirArrows }}</small>
                }
                @if (row.theirWeighted) {
                  <small>{{ row.theirWeighted }}</small>
                }
              </td>
              @if (hasPoints()) {
                <td>{{ row.points ?? '' }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DuelEndsTable {
  readonly rows = input.required<EndRow[]>();
  readonly endName = input('Satz');
  readonly leftName = input('Du');
  readonly rightName = input.required<string>();
  /** The set system's points column */
  readonly hasPoints = input(true);
  /** Each arrow under the totals */
  readonly detailed = input(false);

  protected readonly styles = duel();
  protected readonly cardStyles = cx(card());
}
