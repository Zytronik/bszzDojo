import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ACCOUNT_FIELD_ERRORS,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from '@bszz-dojo/shared';
import { AuthStore } from '../auth/auth.store';
import { failure, type Feedback } from '../core/feedback';
import { FeedbackMessage } from '../ui/feedback-message';
import { formStyles } from '../ui/form-styles';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';
import { Tabs, type TabItem } from '../ui/tabs';

type AuthTab = 'login' | 'register';

/** Only same-app paths, so a crafted link can't send users to another site after login. */
function safeReturnUrl(url: string | undefined): string {
  return url?.startsWith('/') && !url.startsWith('//') ? url : '/';
}

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, PageTitle, Section, Tabs, FeedbackMessage],
  templateUrl: './login-page.html',
})
export class LoginPage {
  /** Query param set by `authGuard` */
  readonly returnUrl = input<string>();

  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly styles = formStyles;
  protected readonly limits = { USERNAME_MAX_LENGTH, EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH };
  protected readonly tabs: TabItem[] = [
    { id: 'login', label: 'Login' },
    { id: 'register', label: 'Register' },
  ];
  protected readonly tab = signal<string>('login');
  private readonly localError = signal<string | null>(null);

  protected readonly login = this.forms.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly register = this.forms.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly feedback = computed((): Feedback | null => {
    const error = this.localError() ?? this.auth.error();
    return error ? failure(error) : null;
  });

  protected selectTab(tab: string): void {
    this.tab.set(tab);
    this.localError.set(null);
    this.auth.clearError();
  }

  protected async submitLogin(): Promise<void> {
    this.localError.set(null);
    if (this.login.invalid) {
      this.localError.set('Bitte gib Benutzername und Passwort ein.');
      return;
    }
    if (await this.auth.login(this.login.getRawValue())) await this.done();
  }

  protected async submitRegister(): Promise<void> {
    const { username, email, password } = this.register.getRawValue();
    const error = !isValidUsername(username)
      ? ACCOUNT_FIELD_ERRORS.username
      : !isValidEmail(email)
        ? ACCOUNT_FIELD_ERRORS.email
        : !isValidPassword(password)
          ? ACCOUNT_FIELD_ERRORS.password
          : null;
    this.localError.set(error);
    if (error) return;
    if (await this.auth.register({ username, email, password })) await this.done();
  }

  private async done(): Promise<void> {
    await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
  }

  protected isTab(tab: AuthTab): boolean {
    return this.tab() === tab;
  }
}
