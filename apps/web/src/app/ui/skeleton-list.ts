import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { css } from 'styled-system/css';
import { skeleton } from 'styled-system/recipes';

/**
 * Placeholder rows while a list loads: `rank` for leaderboards and records, `lines` 1–3 for how
 * much text a row has (title, details, date).
 */
@Component({
  selector: 'app-skeleton-list',
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
    @for (row of indexes(); track row) {
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
export class SkeletonList {
  readonly rows = input(5);
  readonly lines = input<1 | 2 | 3>(2);
  readonly rank = input(false);
  /** Invisible, only holding the space (see `LoadingFrame`). */
  readonly ghost = input(false);

  protected readonly indexes = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
  protected readonly styles = skeleton();
  protected readonly srOnly = css({ srOnly: true });
  protected readonly ghostStyles = css({ visibility: 'hidden', '& *': { animation: 'none' } });
}
