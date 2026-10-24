import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { css, cx } from 'styled-system/css';
import { checkbox } from 'styled-system/recipes';

let nextCheckboxId = 0;

@Component({
  selector: 'app-checkbox-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostStyles' },
  template: `
    <label [class]="rootStyles()" [for]="id">
      {{ label() }}
      <input
        #box
        type="checkbox"
        [id]="id"
        [class]="styles.input"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="checked.set(box.checked)"
      />
      <span [class]="styles.control" aria-hidden="true"></span>
    </label>
  `,
})
export class CheckboxField {
  readonly label = input.required<string>();
  readonly checked = model(false);
  readonly layout = input<'stacked' | 'inline'>('stacked');
  readonly disabled = input(false);

  // Space to the next row only, not at the end of a section.
  protected readonly hostStyles = css({
    display: 'block',
    marginBlockEnd: 'stack',
    _last: { marginBlockEnd: '0' },
  });
  protected readonly styles = checkbox();
  // Both up front: Panda extracts styles statically. `group` makes the box light up while the
  // whole label is hovered (`_groupHover`).
  private readonly roots = {
    stacked: cx('group', this.styles.root),
    inline: cx('group', checkbox({ layout: 'inline' }).root),
  };
  protected readonly rootStyles = computed(() => this.roots[this.layout()]);
  protected readonly id = `checkbox-${nextCheckboxId++}`;
}
