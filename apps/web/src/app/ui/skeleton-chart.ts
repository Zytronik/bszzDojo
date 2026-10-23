import { ChangeDetectionStrategy, Component } from '@angular/core';
import { css } from 'styled-system/css';
import { skeleton } from 'styled-system/recipes';

/** Placeholder for the progress chart while the profile loads. */
@Component({
  selector: 'app-skeleton-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', 'aria-busy': 'true' },
  template: `
    <span [class]="srOnly">Wird geladen…</span>
    <div [class]="styles.chart" aria-hidden="true"></div>
  `,
})
export class SkeletonChart {
  protected readonly styles = skeleton();
  protected readonly srOnly = css({ srOnly: true });
}
