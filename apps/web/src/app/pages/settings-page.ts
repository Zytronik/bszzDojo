import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ACCOUNT_FIELD_ERRORS,
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  RANKS,
  RANK_IDS,
  USERNAME_MAX_LENGTH,
  isValidDisplayName,
  isValidPassword,
  isValidUsername,
  normalizeDisplayName,
  normalizeUsername,
  type RankId,
  type UpdateProfileRequest,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { UsersApiService } from '../core/users-api.service';
import { BadgesSection } from '../settings/badges-section';
import { SettingsStore } from '../settings/settings.store';
import { CheckboxField } from '../ui/checkbox-field';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import { INVALID_FORM, checkForm, messageFrom, required, rule } from '../forms/validators';
import { ToastStore } from '../layout/toast.store';
import { PageTitle } from '../ui/page-title';
import { RankBadge } from '../ui/rank-badge';
import { Section } from '../ui/section';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PageTitle,
    Section,
    CheckboxField,
    FormField,
    FieldControl,
    FormButton,
    RankBadge,
    BadgesSection,
  ],
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  private readonly auth = inject(AuthStore);
  protected readonly settings = inject(SettingsStore);
  private readonly users = inject(UsersApiService);
  private readonly toasts = inject(ToastStore);
  private readonly router = inject(Router);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly leadStyles = css({ marginBlockEnd: '10' });
  protected readonly limits = { USERNAME_MAX_LENGTH, DISPLAY_NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH };
  protected readonly rankRowStyles = css({ display: 'flex', alignItems: 'center', gap: '15' });
  protected readonly ranks = RANK_IDS.map((id) => ({ id, name: RANKS[id].name }));

  protected readonly profileForm = this.forms.group({
    username: ['', [required(), rule(isValidUsername, ACCOUNT_FIELD_ERRORS.username)]],
    displayName: ['', rule(isValidDisplayName, ACCOUNT_FIELD_ERRORS.displayName)],
    rank: this.forms.control<RankId | null>(null),
    password: [
      '',
      rule(
        (value: string) => value.length === 0 || isValidPassword(value),
        ACCOUNT_FIELD_ERRORS.password,
      ),
    ],
    // Only needed with a new password, so it depends on its sibling.
    currentPassword: [
      '',
      messageFrom((control) => {
        const newPassword: unknown = control.parent?.get('password')?.value;
        const current: unknown = control.value;
        return newPassword && !current ? 'Bitte gib dein aktuelles Passwort ein.' : undefined;
      }),
    ],
  });
  protected readonly profilePending = signal(false);
  protected readonly loggingOut = signal(false);
  private readonly profileValue = toSignal(this.profileForm.valueChanges, {
    initialValue: this.profileForm.getRawValue(),
  });

  protected readonly selectedRank = computed(() => this.profileValue().rank ?? null);

  /** The API only asks for it when the password changes. */
  protected readonly needsCurrentPassword = computed(
    () => (this.profileValue().password ?? '').length > 0,
  );

  constructor() {
    this.profileForm.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.profileForm.controls.currentPassword.updateValueAndValidity());
    // Filled with the account's values, again after a save changed them.
    effect(() => {
      const user = this.auth.user();
      if (!user) return;
      untracked(() =>
        this.profileForm.reset({
          username: user.username,
          displayName: user.displayName ?? '',
          rank: user.rank,
          password: '',
          currentPassword: '',
        }),
      );
    });
  }

  protected async saveProfile(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    if (!checkForm(this.profileForm)) {
      this.toasts.error(INVALID_FORM);
      return;
    }
    const { username, displayName, rank, password, currentPassword } =
      this.profileForm.getRawValue();

    // Only what changed is sent, like the old form, which skipped empty fields.
    const changes: UpdateProfileRequest = {};
    if (normalizeUsername(username) !== user.username) changes.username = username;
    const newDisplayName = normalizeDisplayName(displayName);
    if (newDisplayName !== user.displayName) changes.displayName = newDisplayName;
    if (rank !== user.rank) changes.rank = rank;
    if (password.length > 0) changes.password = password;

    if (Object.keys(changes).length === 0) {
      this.toasts.success('Profil erfolgreich aktualisiert.');
      return;
    }
    if (changes.password !== undefined) changes.currentPassword = currentPassword;

    this.profilePending.set(true);
    try {
      const updated = await this.users.updateMe(changes);
      this.auth.updateUser(updated);
      // A new password logs out every device, this one included: log straight back in with it.
      if (changes.password !== undefined) {
        await this.auth.login({ username: updated.username, password: changes.password });
      }
      this.toasts.success('Profil erfolgreich aktualisiert.');
    } catch (failed: unknown) {
      this.toasts.error(errorMessage(failed));
    } finally {
      this.profilePending.set(false);
    }
  }

  protected async logout(): Promise<void> {
    this.loggingOut.set(true);
    try {
      await this.auth.logout();
      await this.router.navigate(['/login']);
    } finally {
      this.loggingOut.set(false);
    }
  }
}
