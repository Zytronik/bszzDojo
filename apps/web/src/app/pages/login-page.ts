import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
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
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import { INVALID_FORM, checkForm, required, rule } from '../forms/validators';
import { ToastStore } from '../layout/toast.store';
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
  imports: [ReactiveFormsModule, PageTitle, Section, Tabs, FormField, FieldControl, FormButton],
  templateUrl: './login-page.html',
})
export class LoginPage {
  /** Set by `authGuard` */
  readonly returnUrl = input<string>();

  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastStore);
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

  protected readonly login = this.forms.group({
    username: ['', required('Bitte gib deinen Benutzernamen ein.')],
    password: ['', required('Bitte gib dein Passwort ein.')],
  });
  protected readonly register = this.forms.group({
    username: ['', [required(), rule(isValidUsername, ACCOUNT_FIELD_ERRORS.username)]],
    displayName: ['', rule(isValidDisplayName, ACCOUNT_FIELD_ERRORS.displayName)],
    password: ['', [required(), rule(isValidPassword, ACCOUNT_FIELD_ERRORS.password)]],
  });

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
    if (!valid) this.toasts.error(INVALID_FORM);
    return valid;
  }

  private async done(): Promise<void> {
    await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
  }

  protected isTab(tab: AuthTab): boolean {
    return this.tab() === tab;
  }
}
