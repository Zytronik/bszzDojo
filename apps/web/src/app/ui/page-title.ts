import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Section } from './section';

@Component({
  selector: 'app-page-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Section],
  template: `
    <app-section>
      <h1>
        {{ title() }}
        @if (titleSecondLine()) {
          <br />{{ titleSecondLine() }}
        }
      </h1>
      @if (description()) {
        <p>{{ description() }}</p>
      }
    </app-section>
  `,
})
export class PageTitle {
  readonly title = input.required<string>();
  readonly titleSecondLine = input<string>('');
  readonly description = input<string>('');
}
