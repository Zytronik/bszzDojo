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
  BADGE_NAME_MAX_LENGTH,
  BADGE_PLACES,
  BADGE_PLACE_LABELS,
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  isValidDisplayName,
  isValidPassword,
  isValidUsername,
  normalizeDisplayName,
  normalizeUsername,
  type BadgePlace,
  type UpdateProfileRequest,
} from '@bszz-dojo/shared';
import { AuthStore } from '../auth/auth.store';
import { BadgesApiService } from '../core/badges-api.service';
import { errorMessage } from '../core/error-message';
import { failure, success, type Feedback } from '../core/feedback';
import { UsersApiService } from '../core/users-api.service';
import { SettingsStore } from '../settings/settings.store';
import { CheckboxField } from '../ui/checkbox-field';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import { INVALID_FORM, checkForm, messageFrom, required, rule } from '../forms/validators';
import { FeedbackMessage } from '../ui/feedback-message';
import { formStyles } from '../ui/form-styles';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PageTitle,
    Section,
    FeedbackMessage,
    CheckboxField,
    FormField,
    FieldControl,
    FormButton,
  ],
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  private readonly auth = inject(AuthStore);
  protected readonly settings = inject(SettingsStore);
  private readonly users = inject(UsersApiService);
  private readonly badges = inject(BadgesApiService);
  private readonly router = inject(Router);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly styles = formStyles;
  protected readonly badgeNameMaxLength = BADGE_NAME_MAX_LENGTH;
  protected readonly limits = { USERNAME_MAX_LENGTH, DISPLAY_NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH };
  protected readonly places = BADGE_PLACES.map((value) => ({
    value,
    label: `${value} (${BADGE_PLACE_LABELS[value]})`,
  }));
  protected readonly themeError = failure('Das Theme konnte nicht gespeichert werden.');

  protected readonly badgeForm = this.forms.group({
    name: ['', required('Bitte gib einen Namen ein.')],
    place: this.forms.control<BadgePlace>(1),
  });
  protected readonly badgePending = signal(false);
  protected readonly badgeFeedback = signal<Feedback | null>(null);

  protected readonly profileForm = this.forms.group({
    username: ['', [required(), rule(isValidUsername, ACCOUNT_FIELD_ERRORS.username)]],
    displayName: ['', rule(isValidDisplayName, ACCOUNT_FIELD_ERRORS.displayName)],
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
  protected readonly profileFeedback = signal<Feedback | null>(null);
  protected readonly loggingOut = signal(false);
  private readonly profileValue = toSignal(this.profileForm.valueChanges, {
    initialValue: this.profileForm.getRawValue(),
  });

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
          password: '',
          currentPassword: '',
        }),
      );
    });
  }

  protected async requestBadge(): Promise<void> {
    if (!checkForm(this.badgeForm)) {
      this.badgeFeedback.set(INVALID_FORM);
      return;
    }
    const { name, place } = this.badgeForm.getRawValue();
    this.badgePending.set(true);
    try {
      const response = await this.badges.request({ name: name.trim(), place });
      this.badgeFeedback.set(success(response.message));
      this.badgeForm.reset();
    } catch (error: unknown) {
      this.badgeFeedback.set(failure(errorMessage(error)));
    } finally {
      this.badgePending.set(false);
    }
  }

  protected async saveProfile(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    if (!checkForm(this.profileForm)) {
      this.profileFeedback.set(INVALID_FORM);
      return;
    }
    const { username, displayName, password, currentPassword } = this.profileForm.getRawValue();

    // Only what changed is sent, like the old form, which skipped empty fields.
    const changes: UpdateProfileRequest = {};
    if (normalizeUsername(username) !== user.username) changes.username = username;
    const newDisplayName = normalizeDisplayName(displayName);
    if (newDisplayName !== user.displayName) changes.displayName = newDisplayName;
    if (password.length > 0) changes.password = password;

    if (Object.keys(changes).length === 0) {
      this.profileFeedback.set(success('Profil erfolgreich aktualisiert.'));
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
      this.profileFeedback.set(success('Profil erfolgreich aktualisiert.'));
    } catch (failed: unknown) {
      this.profileFeedback.set(failure(errorMessage(failed)));
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
