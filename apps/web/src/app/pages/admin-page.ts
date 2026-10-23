import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BADGE_EARLIEST_YEAR,
  BADGE_NAME_MAX_LENGTH,
  BADGE_PLACES,
  BADGE_PLACE_LABELS,
  RANKS,
  RANK_IDS,
  currentClubMonth,
  shownName,
  type AdminUser,
  type BadgePlace,
  type BadgeRequest,
  type MessageResponse,
  type RankId,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { record } from 'styled-system/recipes';
import { AdminApiService } from '../admin/admin-api.service';
import { AuthStore } from '../auth/auth.store';
import { AppUpdateService } from '../core/app-update.service';
import { errorMessage } from '../core/error-message';
import { failure, success, type Feedback } from '../core/feedback';
import { formatDate } from '../core/score-labels';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { FeedbackMessage } from '../ui/feedback-message';
import { formStyles } from '../ui/form-styles';
import { Icon } from '../ui/icon';
import { faCheck, faDeleteLeft } from '../ui/icons';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';
import { ShownNamePipe } from '../ui/shown-name.pipe';
import { Tabs, type TabItem } from '../ui/tabs';

/** A year in the request's name ("Chlausschüsse 2023"), else the current one. */
function yearFromName(name: string, fallback: number): number {
  const match = /\b(19|20)\d{2}\b/.exec(name);
  return match ? Number(match[0]) : fallback;
}

@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageTitle,
    Section,
    Tabs,
    FeedbackMessage,
    ConfirmDialog,
    Icon,
    ShownNamePipe,
  ],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  protected readonly auth = inject(AuthStore);
  private readonly api = inject(AdminApiService);
  private readonly appUpdate = inject(AppUpdateService);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly styles = formStyles;
  protected readonly recordStyles = record();
  protected readonly mutedStyles = css({ layerStyle: 'muted' });
  protected readonly icons = { faCheck, faDeleteLeft };
  protected readonly formatDate = formatDate;
  protected readonly currentYear = currentClubMonth().year;
  protected readonly earliestYear = BADGE_EARLIEST_YEAR;
  protected readonly badgeNameMaxLength = BADGE_NAME_MAX_LENGTH;
  protected readonly ranks = RANK_IDS.map((id) => ({ id, name: RANKS[id].name }));
  protected readonly places = BADGE_PLACES.map((value) => ({
    value,
    label: BADGE_PLACE_LABELS[value],
  }));

  // App update
  protected readonly updateDialogOpen = signal(false);
  protected readonly updating = signal(false);

  // Badge requests
  protected readonly requests = resource({ loader: () => this.api.badgeRequests() });
  protected readonly requestToApprove = signal<BadgeRequest | null>(null);
  protected readonly requestToReject = signal<BadgeRequest | null>(null);
  protected readonly approveYear = signal(this.currentYear);
  protected readonly requestPending = signal(false);
  protected readonly requestsFeedback = signal<Feedback | null>(null);

  // Ranks and badges
  protected readonly editTabs: TabItem[] = [
    { id: 'rank', label: 'Abzeichen' },
    { id: 'badge', label: 'Auszeichnung' },
  ];
  protected readonly editTab = signal('rank');
  protected readonly editPending = signal(false);
  protected readonly editFeedback = signal<Feedback | null>(null);
  protected readonly rankForm = this.forms.group({
    rank: this.forms.control<RankId>(RANK_IDS[0]),
    username: '',
  });
  protected readonly badgeForm = this.forms.group({
    name: '',
    username: '',
    year: this.forms.control<number | null>(this.currentYear),
    place: this.forms.control<BadgePlace>(1),
  });

  // Users
  protected readonly users = resource({ loader: () => this.api.users() });
  protected readonly userToDelete = signal<AdminUser | null>(null);
  protected readonly deletingUser = signal(false);
  protected readonly usersFeedback = signal<Feedback | null>(null);

  protected async updateApp(): Promise<void> {
    this.updating.set(true);
    await this.appUpdate.forceUpdate();
  }

  protected openApprove(request: BadgeRequest): void {
    this.approveYear.set(yearFromName(request.name, this.currentYear));
    this.requestToApprove.set(request);
  }

  protected async approve(): Promise<void> {
    const request = this.requestToApprove();
    const year = this.approveYear();
    if (!request) return;
    if (!Number.isInteger(year) || year < BADGE_EARLIEST_YEAR || year > this.currentYear) {
      this.requestsFeedback.set(failure('Bitte gib ein gültiges Jahr ein.'));
      return;
    }
    await this.runRequestAction(() => this.api.approveBadgeRequest(request.id, { year }));
    this.requestToApprove.set(null);
  }

  protected async reject(): Promise<void> {
    const request = this.requestToReject();
    if (!request) return;
    await this.runRequestAction(async () => {
      await this.api.rejectBadgeRequest(request.id);
      return { message: 'Anfrage abgelehnt.' };
    });
    this.requestToReject.set(null);
  }

  protected giveRank(): Promise<void> {
    const { rank, username } = this.rankForm.getRawValue();
    return this.runEdit(username, () => this.api.setRank({ username: username.trim(), rank }));
  }

  protected removeRank(): Promise<void> {
    const { username } = this.rankForm.getRawValue();
    return this.runEdit(username, () => this.api.removeRank({ username: username.trim() }));
  }

  protected giveBadge(): Promise<void> {
    const { name, username, year, place } = this.badgeForm.getRawValue();
    if (!this.validBadge(name, year)) return Promise.resolve();
    return this.runEdit(username, () =>
      this.api.giveBadge({ username: username.trim(), name: name.trim(), year: year ?? 0, place }),
    );
  }

  protected removeBadge(): Promise<void> {
    const { name, username, year } = this.badgeForm.getRawValue();
    if (!this.validBadge(name, year)) return Promise.resolve();
    return this.runEdit(username, () =>
      this.api.removeBadge({ username: username.trim(), name: name.trim(), year: year ?? 0 }),
    );
  }

  protected async deleteUser(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;
    this.deletingUser.set(true);
    try {
      await this.api.deleteUser(user.id);
      this.usersFeedback.set(success(`${shownName(user)} wurde gelöscht.`));
      this.users.reload();
      this.requests.reload();
    } catch (error: unknown) {
      this.usersFeedback.set(failure(errorMessage(error)));
    } finally {
      this.deletingUser.set(false);
      this.userToDelete.set(null);
    }
  }

  private validBadge(name: string, year: number | null): boolean {
    if (name.trim().length === 0) {
      this.editFeedback.set(failure('Bitte gib einen Namen ein.'));
      return false;
    }
    if (
      year === null ||
      !Number.isInteger(year) ||
      year < BADGE_EARLIEST_YEAR ||
      year > this.currentYear
    ) {
      this.editFeedback.set(failure('Bitte gib ein gültiges Jahr ein.'));
      return false;
    }
    return true;
  }

  private async runEdit(username: string, action: () => Promise<MessageResponse>): Promise<void> {
    if (username.trim().length === 0) {
      this.editFeedback.set(failure('Bitte gib einen Benutzernamen ein.'));
      return;
    }
    this.editPending.set(true);
    try {
      this.editFeedback.set(success((await action()).message));
    } catch (error: unknown) {
      this.editFeedback.set(failure(errorMessage(error)));
    } finally {
      this.editPending.set(false);
    }
  }

  private async runRequestAction(action: () => Promise<MessageResponse>): Promise<void> {
    this.requestPending.set(true);
    try {
      this.requestsFeedback.set(success((await action()).message));
      this.requests.reload();
    } catch (error: unknown) {
      this.requestsFeedback.set(failure(errorMessage(error)));
    } finally {
      this.requestPending.set(false);
    }
  }
}
