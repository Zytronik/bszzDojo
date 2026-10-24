import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { css } from 'styled-system/css';
import { Skeleton } from './skeleton';

/**
 * The skeleton while `loading`, then the projected content. The skeleton stays in the same grid
 * cell afterwards, invisible, so the area keeps its height and the page doesn't jump when the
 * answer is short ("Keine … vorhanden.").
 */
@Component({
  selector: 'app-loading-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton],
  host: { '[class]': 'styles' },
  template: `
    <app-skeleton [lines]="lines()" [rank]="rank()" [chart]="chart()" [ghost]="!loading()" />
    <div [class]="contentStyles"><ng-content /></div>
  `,
})
export class LoadingFrame {
  readonly loading = input.required<boolean>();
  readonly lines = input<1 | 2 | 3>(2);
  readonly rank = input(false);
  readonly chart = input(false);

  protected readonly styles = css({
    display: 'grid',
    // minWidth 0 so long names still wrap inside the cell.
    '& > *': { gridArea: '1 / 1', minW: '0' },
  });
  // A column, so an empty state can grow to the cell's height.
  protected readonly contentStyles = css({ display: 'flex', flexDir: 'column' });
}
