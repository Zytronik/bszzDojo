import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ACCOUNT_FIELD_ERRORS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isValidPassword,
} from '@bszz-dojo/shared';
import { AuthApiService } from '../auth/auth-api.service';
import { errorMessage } from '../core/error-message';
import { failure, success, type Feedback } from '../core/feedback';
import { FeedbackMessage } from '../ui/feedback-message';
import { formStyles } from '../ui/form-styles';
import { Section } from '../ui/section';

/** Opened from the link in the reset mail: `/reset-password?token=…` */
@Component({
  selector: 'app-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Section, FeedbackMessage],
  template: `
    <app-section>
      <app-feedback-message [feedback]="feedback()" />
      <h2>Passwort zurücksetzen</h2>
      @if (token()) {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div [class]="styles.field.root">
            <label for="reset-password" [class]="styles.field.label">Neues Passwort:</label>
            <input
              id="reset-password"
              type="password"
              [class]="styles.input"
              formControlName="password"
              autocomplete="new-password"
              [maxLength]="passwordMaxLength"
            />
            <span [class]="styles.field.hint">Mindestens {{ passwordMinLength }} Zeichen</span>
          </div>
          <button type="submit" [class]="styles.button" [disabled]="pending() || done()">
            Passwort zurücksetzen
          </button>
        </form>
      } @else {
        <p>Der Link ist ungültig. Fordere unter "Passwort vergessen" einen neuen an.</p>
      }
      <a routerLink="/login" [class]="styles.bottomLink">Zurück zum Login</a>
    </app-section>
  `,
})
export class ResetPasswordPage {
  /** Query param from the mail */
  readonly token = input<string>();

  private readonly api = inject(AuthApiService);
  protected readonly form = inject(NonNullableFormBuilder).group({ password: '' });

  protected readonly styles = formStyles;
  protected readonly passwordMinLength = PASSWORD_MIN_LENGTH;
  protected readonly passwordMaxLength = PASSWORD_MAX_LENGTH;
  protected readonly pending = signal(false);
  protected readonly done = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  protected async submit(): Promise<void> {
    const token = this.token();
    const { password } = this.form.getRawValue();
    if (!token) return;
    if (!isValidPassword(password)) {
      this.feedback.set(failure(ACCOUNT_FIELD_ERRORS.password));
      return;
    }
    this.pending.set(true);
    try {
      const response = await this.api.resetPassword({ token, password });
      this.feedback.set(success(response.message));
      this.done.set(true);
      this.form.reset();
    } catch (error: unknown) {
      this.feedback.set(failure(errorMessage(error)));
    } finally {
      this.pending.set(false);
    }
  }
}
