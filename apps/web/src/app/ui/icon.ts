import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { css } from 'styled-system/css';

/** Decorative by default; give it a `label` when nothing else names what it does. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostStyles' },
  template: `
    <svg
      [class]="styles"
      [attr.viewBox]="viewBox()"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.aria-label]="label() || null"
      [attr.role]="label() ? 'img' : null"
      focusable="false"
    >
      @for (path of paths(); track $index) {
        <path fill="currentColor" [attr.d]="path" />
      }
    </svg>
  `,
})
export class Icon {
  readonly icon = input.required<IconDefinition>();
  readonly label = input<string>('');

  /**
   * Without a line height of its own the host is a whole text line tall where it's a block (in a
   * flex row), and the icon, aligned to the text's middle, sits below the row's centre.
   */
  protected readonly hostStyles = css({ lineHeight: '0' });
  protected readonly styles = css({
    display: 'inline-block',
    h: '1em',
    w: 'auto',
    overflow: 'visible',
  });
  protected readonly viewBox = computed(() => {
    const [width, height] = this.icon().icon;
    return `0 0 ${width} ${height}`;
  });
  protected readonly paths = computed(() => {
    const data = this.icon().icon[4];
    return Array.isArray(data) ? data : [data];
  });
}
