import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { cx } from 'styled-system/css';
import { checkbox } from 'styled-system/recipes';

let nextCheckboxId = 0;

/** The old app's custom checkbox: the label text, then a 25px box. */
@Component({
  selector: 'app-checkbox-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [class]="rootStyles" [for]="id">
      {{ label() }}
      <input
        #box
        type="checkbox"
        [id]="id"
        [class]="styles.input"
        [checked]="checked()"
        (change)="checked.set(box.checked)"
      />
      <span [class]="styles.control" aria-hidden="true"></span>
    </label>
  `,
})
export class CheckboxField {
  readonly label = input.required<string>();
  readonly checked = model(false);

  protected readonly styles = checkbox();
  // `group` makes the box light up while the whole label is hovered (`_groupHover`).
  protected readonly rootStyles = cx('group', this.styles.root);
  protected readonly id = `checkbox-${nextCheckboxId++}`;
}
