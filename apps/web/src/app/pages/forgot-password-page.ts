import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ACCOUNT_FIELD_ERRORS, EMAIL_MAX_LENGTH, isValidEmail } from '@bszz-dojo/shared';
import { AuthApiService } from '../auth/auth-api.service';
import { errorMessage } from '../core/error-message';
import { failure, success, type Feedback } from '../core/feedback';
import { FeedbackMessage } from '../ui/feedback-message';
import { formStyles } from '../ui/form-styles';
import { Section } from '../ui/section';

@Component({
  selector: 'app-forgot-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Section, FeedbackMessage],
  template: `
    <app-section>
      <app-feedback-message [feedback]="feedback()" />
      <h2>Passwort vergessen</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div [class]="styles.field.root">
          <label for="forgot-email" [class]="styles.field.label">E-Mail:</label>
          <input
            id="forgot-email"
            type="email"
            [class]="styles.input"
            formControlName="email"
            autocomplete="email"
            [maxLength]="emailMaxLength"
          />
        </div>
        <button type="submit" [class]="styles.button" [disabled]="pending()">
          Passwort zurücksetzen
        </button>
      </form>
      <a routerLink="/login" [class]="styles.bottomLink">Zurück zum Login</a>
    </app-section>
  `,
})
export class ForgotPasswordPage {
  private readonly api = inject(AuthApiService);
  protected readonly form = inject(NonNullableFormBuilder).group({ email: '' });

  protected readonly styles = formStyles;
  protected readonly emailMaxLength = EMAIL_MAX_LENGTH;
  protected readonly pending = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  protected async submit(): Promise<void> {
    const { email } = this.form.getRawValue();
    if (!isValidEmail(email)) {
      this.feedback.set(failure(ACCOUNT_FIELD_ERRORS.email));
      return;
    }
    this.pending.set(true);
    try {
      const response = await this.api.forgotPassword({ email });
      this.feedback.set(success(response.message));
      this.form.reset();
    } catch (error: unknown) {
      this.feedback.set(failure(errorMessage(error)));
    } finally {
      this.pending.set(false);
    }
  }
}
