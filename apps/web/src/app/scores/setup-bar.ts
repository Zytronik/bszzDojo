import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { setupLabel, type ArcherySetup } from '@bszz-dojo/shared';
import { css, cx } from 'styled-system/css';
import { card } from 'styled-system/recipes';
import { Icon } from '../ui/icon';
import { faChevronRight } from '../ui/icons';

/** The archer's current setup as one button that opens the setup dialog. */
@Component({
  selector: 'app-setup-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <button type="button" [class]="styles.bar" [disabled]="disabled()" (click)="edit.emit()">
      <span [class]="styles.text">
        <span [class]="styles.caption">Dein Setup</span>
        <span [class]="styles.label">{{ label() }}</span>
      </span>
      @if (!disabled()) {
        <span [class]="styles.change">
          ändern
          <app-icon [icon]="faChevronRight" />
        </span>
      }
    </button>
  `,
})
export class SetupBar {
  readonly setup = input.required<ArcherySetup | null>();
  /** While the setup can't change, e.g. once arrows are placed on the target */
  readonly disabled = input(false);
  readonly edit = output();

  protected readonly faChevronRight = faChevronRight;
  protected readonly label = computed(() => {
    const setup = this.setup();
    return setup ? setupLabel(setup) : 'Wähle Bogen, Distanz und Scheibe';
  });
  protected readonly styles = {
    bar: cx(
      card({ size: 'sm' }),
      css({
        display: 'flex',
        alignItems: 'center',
        gap: '10',
        w: 'full',
        textAlign: 'start',
        cursor: 'pointer',
        _disabled: { cursor: 'default' },
      }),
    ),
    text: css({ display: 'flex', flexDirection: 'column', minW: '0' }),
    caption: css({ textStyle: 'body.small', layerStyle: 'muted' }),
    label: css({ fontWeight: 'bold', truncate: true }),
    change: css({
      display: 'flex',
      alignItems: 'center',
      gap: '5',
      marginInlineStart: 'auto',
      textStyle: 'body.small',
      color: 'accent.default',
    }),
  };
}
