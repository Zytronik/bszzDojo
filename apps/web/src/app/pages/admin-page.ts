import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { shownName, type AdminUser } from '@bszz-dojo/shared';
import { record } from 'styled-system/recipes';
import { AdminApiService } from '../admin/admin-api.service';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { failure, success, type Feedback } from '../core/feedback';
import { formatDate } from '../core/score-labels';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { FeedbackMessage } from '../ui/feedback-message';
import { Icon } from '../ui/icon';
import { faDeleteLeft } from '../ui/icons';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';
import { ShownNamePipe } from '../ui/shown-name.pipe';
import { SkeletonList } from '../ui/skeleton-list';

@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageTitle,
    Section,
    FeedbackMessage,
    ConfirmDialog,
    Icon,
    ShownNamePipe,
    SkeletonList,
  ],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  protected readonly auth = inject(AuthStore);
  private readonly api = inject(AdminApiService);

  protected readonly recordStyles = record();
  protected readonly icons = { faDeleteLeft };
  protected readonly formatDate = formatDate;

  protected readonly users = resource({ loader: () => this.api.users() });
  protected readonly userToDelete = signal<AdminUser | null>(null);
  protected readonly deletingUser = signal(false);
  protected readonly usersFeedback = signal<Feedback | null>(null);

  protected async deleteUser(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;
    this.deletingUser.set(true);
    try {
      await this.api.deleteUser(user.id);
      this.usersFeedback.set(success(`${shownName(user)} wurde gelöscht.`));
      this.users.reload();
    } catch (error: unknown) {
      this.usersFeedback.set(failure(errorMessage(error)));
    } finally {
      this.deletingUser.set(false);
      this.userToDelete.set(null);
    }
  }
}
