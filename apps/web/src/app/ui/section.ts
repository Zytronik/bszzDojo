import { ChangeDetectionStrategy, Component } from '@angular/core';
import { css, cx } from 'styled-system/css';
import { pageContainer } from 'styled-system/recipes';

@Component({
  selector: 'app-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section [class]="styles"><ng-content /></section>`,
})
export class Section {
  protected readonly styles = cx(pageContainer(), css({ py: 'section' }));
}
