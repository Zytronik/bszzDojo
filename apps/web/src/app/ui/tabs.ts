import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { tabs as tabsRecipe } from 'styled-system/recipes';

export interface TabItem {
  id: string;
  label: string;
}

let nextTabsId = 0;

/**
 * A tab bar over projected content. The parent renders the selected tab's content itself
 * (`@switch` on `selected`), so hidden tabs aren't in the DOM at all.
 */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="styles.list" role="tablist" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          [id]="tabId(tab.id)"
          [class]="styles.trigger"
          [attr.aria-selected]="tab.id === selected()"
          [attr.aria-controls]="panelId"
          [tabIndex]="tab.id === selected() ? 0 : -1"
          (click)="selected.set(tab.id)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
    <div
      role="tabpanel"
      [id]="panelId"
      [attr.aria-labelledby]="tabId(selected())"
      [class]="styles.panel"
    >
      <ng-content />
    </div>
  `,
})
export class Tabs {
  readonly tabs = input.required<readonly TabItem[]>();
  readonly selected = model.required<string>();

  protected readonly styles = tabsRecipe();
  private readonly baseId = `tabs-${nextTabsId++}`;
  protected readonly panelId = `${this.baseId}-panel`;

  protected tabId(id: string): string {
    return `${this.baseId}-${id}`;
  }

  /** Arrow keys move between tabs, as screen reader users expect from a tab list. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const tabs = this.tabs();
    const index = tabs.findIndex((tab) => tab.id === this.selected());
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    if (!next) return;
    this.selected.set(next.id);
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLElement>(`#${this.tabId(next.id)}`)
      ?.focus();
  }
}
