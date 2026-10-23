import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { css } from 'styled-system/css';
import { SkeletonChart } from './skeleton-chart';
import { SkeletonList } from './skeleton-list';

/**
 * A list's place on the page: the skeleton while `loading`, then the projected content. The
 * skeleton stays in the same grid cell afterwards, invisible, so the area keeps at least its
 * height and the page doesn't jump when the answer is short ("Keine … vorhanden.").
 */
@Component({
  selector: 'app-loading-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonList, SkeletonChart],
  host: { '[class]': 'styles' },
  template: `
    @if (chart()) {
      <app-skeleton-chart [ghost]="!loading()" />
    } @else {
      <app-skeleton-list [rows]="rows()" [lines]="lines()" [rank]="rank()" [ghost]="!loading()" />
    }
    <div><ng-content /></div>
  `,
})
export class LoadingFrame {
  readonly loading = input.required<boolean>();
  readonly rows = input(5);
  readonly lines = input<1 | 2 | 3>(2);
  readonly rank = input(false);
  /** The progress chart's block instead of rows */
  readonly chart = input(false);

  protected readonly styles = css({
    display: 'grid',
    // minWidth 0 so long names still wrap inside the cell.
    '& > *': { gridArea: '1 / 1', minW: '0' },
  });
}
