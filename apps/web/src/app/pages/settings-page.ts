import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ACCOUNT_FIELD_ERRORS,
  BADGE_NAME_MAX_LENGTH,
  BADGE_PLACES,
  BADGE_PLACE_LABELS,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  normalizeEmail,
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
import { FeedbackMessage } from '../ui/feedback-message';
import { formStyles } from '../ui/form-styles';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PageTitle, Section, FeedbackMessage, CheckboxField],
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
  protected readonly limits = { USERNAME_MAX_LENGTH, EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH };
  protected readonly places = BADGE_PLACES.map((value) => ({
    value,
    label: `${value} (${BADGE_PLACE_LABELS[value]})`,
  }));
  protected readonly themeError = failure('Das Theme konnte nicht gespeichert werden.');

  protected readonly badgeForm = this.forms.group({
    name: '',
    place: this.forms.control<BadgePlace>(1),
  });
  protected readonly badgePending = signal(false);
  protected readonly badgeFeedback = signal<Feedback | null>(null);

  protected readonly profileForm = this.forms.group({
    username: '',
    email: '',
    password: '',
    currentPassword: '',
  });
  protected readonly profilePending = signal(false);
  protected readonly profileFeedback = signal<Feedback | null>(null);
  private readonly profileValue = toSignal(this.profileForm.valueChanges, {
    initialValue: this.profileForm.getRawValue(),
  });

  /** The API only asks for it when the email or the password changes. */
  protected readonly needsCurrentPassword = computed(() => {
    const user = this.auth.user();
    const { email = '', password = '' } = this.profileValue();
    return password.length > 0 || (user !== null && normalizeEmail(email) !== user.email);
  });

  constructor() {
    // Filled with the account's values, again after a save changed them.
    effect(() => {
      const user = this.auth.user();
      if (!user) return;
      untracked(() =>
        this.profileForm.reset({
          username: user.username,
          email: user.email,
          password: '',
          currentPassword: '',
        }),
      );
    });
  }

  protected async requestBadge(): Promise<void> {
    const { name, place } = this.badgeForm.getRawValue();
    if (name.trim().length === 0) {
      this.badgeFeedback.set(failure('Bitte gib einen Namen ein.'));
      return;
    }
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
    const { username, email, password, currentPassword } = this.profileForm.getRawValue();

    // Only what changed is sent, like the old form, which skipped empty fields.
    const changes: UpdateProfileRequest = {};
    if (normalizeUsername(username) !== user.username) changes.username = username;
    if (normalizeEmail(email) !== user.email) changes.email = email;
    if (password.length > 0) changes.password = password;

    const error =
      changes.username !== undefined && !isValidUsername(changes.username)
        ? ACCOUNT_FIELD_ERRORS.username
        : changes.email !== undefined && !isValidEmail(changes.email)
          ? ACCOUNT_FIELD_ERRORS.email
          : changes.password !== undefined && !isValidPassword(changes.password)
            ? ACCOUNT_FIELD_ERRORS.password
            : this.needsCurrentPassword() && currentPassword.length === 0
              ? 'Bitte gib dein aktuelles Passwort ein.'
              : null;
    if (error) {
      this.profileFeedback.set(failure(error));
      return;
    }
    if (Object.keys(changes).length === 0) {
      this.profileFeedback.set(success('Profil erfolgreich aktualisiert.'));
      return;
    }
    if (this.needsCurrentPassword()) changes.currentPassword = currentPassword;

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
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
