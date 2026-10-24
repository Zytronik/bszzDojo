import { ChangeDetectionStrategy, Component } from '@angular/core';
import { emptyState } from 'styled-system/recipes';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'styles', role: 'status' },
  template: `<ng-content />`,
})
export class EmptyState {
  protected readonly styles = emptyState();
}
