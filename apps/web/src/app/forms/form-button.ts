import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { button, spinner } from 'styled-system/recipes';

type ButtonSize = 'block' | 'inline';
type ButtonTone = 'accent' | 'surface';

/** Every variant up front for Panda: `block` in forms, `inline` next to other content. */
const STYLES: Record<ButtonSize, Record<ButtonTone, string>> = {
  block: { accent: button(), surface: button({ tone: 'surface' }) },
  inline: {
    accent: button({ size: 'inline' }),
    surface: button({ size: 'inline', tone: 'surface' }),
  },
};

/** While `pending`, it's disabled and shows a spinner before its label. */
@Component({
  selector: 'button[appButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'styles()',
    '[disabled]': 'pending() || disabled()',
    '[attr.aria-busy]': 'pending() || null',
  },
  template: `
    @if (pending()) {
      <span [class]="spinnerStyles" aria-hidden="true"></span>
    }
    <ng-content />
  `,
})
export class FormButton {
  readonly pending = input(false);
  readonly disabled = input(false);
  readonly size = input<ButtonSize>('block');
  readonly tone = input<ButtonTone>('accent');

  protected readonly styles = computed(() => STYLES[this.size()][this.tone()]);
  protected readonly spinnerStyles = spinner();
}
