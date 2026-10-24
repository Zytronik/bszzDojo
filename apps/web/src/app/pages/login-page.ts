import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, type AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ACCOUNT_FIELD_ERRORS,
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  isValidDisplayName,
  isValidPassword,
  isValidUsername,
} from '@bszz-dojo/shared';
import { AuthStore } from '../auth/auth.store';
import { failure, type Feedback } from '../core/feedback';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import { INVALID_FORM, checkForm, required, rule } from '../forms/validators';
import { FeedbackMessage } from '../ui/feedback-message';
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
  imports: [
    ReactiveFormsModule,
    PageTitle,
    Section,
    Tabs,
    FeedbackMessage,
    FormField,
    FieldControl,
    FormButton,
  ],
  templateUrl: './login-page.html',
})
export class LoginPage {
  /** Set by `authGuard` */
  readonly returnUrl = input<string>();

  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly limits = {
    USERNAME_MAX_LENGTH,
    DISPLAY_NAME_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
  };
  protected readonly tabs: TabItem[] = [
    { id: 'login', label: 'Login' },
    { id: 'register', label: 'Register' },
  ];
  protected readonly tab = signal<string>('login');
  private readonly invalidSubmit = signal(false);

  protected readonly login = this.forms.group({
    username: ['', required('Bitte gib deinen Benutzernamen ein.')],
    password: ['', required('Bitte gib dein Passwort ein.')],
  });
  protected readonly register = this.forms.group({
    username: ['', [required(), rule(isValidUsername, ACCOUNT_FIELD_ERRORS.username)]],
    displayName: ['', rule(isValidDisplayName, ACCOUNT_FIELD_ERRORS.displayName)],
    password: ['', [required(), rule(isValidPassword, ACCOUNT_FIELD_ERRORS.password)]],
  });

  protected readonly feedback = computed((): Feedback | null => {
    if (this.invalidSubmit()) return INVALID_FORM;
    const error = this.auth.error();
    return error ? failure(error) : null;
  });

  protected selectTab(tab: string): void {
    this.tab.set(tab);
    this.invalidSubmit.set(false);
    this.auth.clearError();
  }

  protected async submitLogin(): Promise<void> {
    if (!this.validate(this.login)) return;
    if (await this.auth.login(this.login.getRawValue())) await this.done();
  }

  protected async submitRegister(): Promise<void> {
    if (!this.validate(this.register)) return;
    if (await this.auth.register(this.register.getRawValue())) await this.done();
  }

  private validate(form: AbstractControl): boolean {
    const valid = checkForm(form);
    this.invalidSubmit.set(!valid);
    if (!valid) this.auth.clearError();
    return valid;
  }

  private async done(): Promise<void> {
    await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
  }

  protected isTab(tab: AuthTab): boolean {
    return this.tab() === tab;
  }
}
