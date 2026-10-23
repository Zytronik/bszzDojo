import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { message } from 'styled-system/recipes';
import type { Feedback } from '../core/feedback';

@Component({
  selector: 'app-feedback-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (feedback(); as feedback) {
      <div
        [class]="styles[feedback.status]"
        [attr.role]="feedback.status === 'error' ? 'alert' : 'status'"
      >
        {{ feedback.text }}
      </div>
    }
  `,
})
export class FeedbackMessage {
  readonly feedback = input<Feedback | null>(null);

  // Both variants up front: Panda extracts styles statically, so variants aren't picked at runtime.
  protected readonly styles = {
    success: message({ status: 'success' }),
    error: message({ status: 'error' }),
  };
}
