import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { button, spinner } from 'styled-system/recipes';

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
  /** A second choice next to the main one: `neutral` in a card or dialog, `subtle` on the page */
  readonly tone = input<'accent' | 'neutral' | 'subtle'>('accent');

  // Both up front: Panda extracts styles statically, so variants aren't picked at runtime.
  private readonly tones = {
    accent: button({ tone: 'accent' }),
    neutral: button({ tone: 'neutral' }),
    subtle: button({ tone: 'subtle' }),
  };
  protected readonly styles = computed(() => this.tones[this.tone()]);
  protected readonly spinnerStyles = spinner();
}
