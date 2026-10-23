import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { css } from 'styled-system/css';
import { skeleton } from 'styled-system/recipes';

/** Placeholder for the progress chart while the profile loads. */
@Component({
  selector: 'app-skeleton-chart',
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
    <div [class]="styles.chart" aria-hidden="true"></div>
  `,
})
export class SkeletonChart {
  /** Invisible, only holding the space (see `LoadingFrame`). */
  readonly ghost = input(false);

  protected readonly styles = skeleton();
  protected readonly srOnly = css({ srOnly: true });
  protected readonly ghostStyles = css({ visibility: 'hidden', '& *': { animation: 'none' } });
}
