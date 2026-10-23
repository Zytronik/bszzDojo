import { ChangeDetectionStrategy, Component } from '@angular/core';
import { emptyState } from 'styled-system/recipes';

/** `<app-empty-state>Keine Rekorde vorhanden.</app-empty-state>` in place of an empty list. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'styles', role: 'status' },
  template: `<ng-content />`,
})
export class EmptyState {
  protected readonly styles = emptyState();
}
