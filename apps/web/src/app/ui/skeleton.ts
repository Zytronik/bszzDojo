import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { css } from 'styled-system/css';
import { skeleton } from 'styled-system/recipes';

/**
 * Placeholder while a list loads: one row with `lines` 1–3 of text (title, details, date) and an
 * optional `rank` column, or the progress `chart`'s block.
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "ghost() ? null : 'status'",
    '[attr.aria-busy]': 'ghost() ? null : true',
    '[attr.aria-hidden]': 'ghost() || null',
    '[class]': "ghost() ? ghostStyles : ''",
  },
  template: `
    @if (!ghost()) {
      <span [class]="srOnly">Wird geladen…</span>
    }
    @if (chart()) {
      <div [class]="styles.chart" aria-hidden="true"></div>
    } @else {
      <div [class]="styles.row" aria-hidden="true">
        @if (rank()) {
          <div [class]="styles.rank"></div>
        }
        <div [class]="styles.body">
          <div [class]="styles.title"></div>
          @if (lines() > 1) {
            <div [class]="styles.line"></div>
          }
          @if (lines() > 2) {
            <div [class]="styles.meta"></div>
          }
        </div>
      </div>
    }
  `,
})
export class Skeleton {
  readonly lines = input<1 | 2 | 3>(2);
  readonly rank = input(false);
  readonly chart = input(false);
  /** Invisible, only holding the space (see `LoadingFrame`). */
  readonly ghost = input(false);

  protected readonly styles = skeleton();
  protected readonly srOnly = css({ srOnly: true });
  protected readonly ghostStyles = css({ visibility: 'hidden', '& *': { animation: 'none' } });
}
