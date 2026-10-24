import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatGermanDate, shownName, type AdminUser } from '@bszz-dojo/shared';
import { record } from 'styled-system/recipes';
import { AdminApiService } from '../admin/admin-api.service';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { EmptyState } from '../ui/empty-state';
import { ToastStore } from '../layout/toast.store';
import { Icon } from '../ui/icon';
import { faDeleteLeft } from '../ui/icons';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';
import { ShownNamePipe } from '../ui/shown-name.pipe';
import { LoadingFrame } from '../ui/loading-frame';

@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageTitle,
    Section,
    ConfirmDialog,
    Icon,
    ShownNamePipe,
    LoadingFrame,
    EmptyState,
  ],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  protected readonly auth = inject(AuthStore);
  private readonly api = inject(AdminApiService);
  private readonly toasts = inject(ToastStore);

  protected readonly recordStyles = record();
  protected readonly icons = { faDeleteLeft };
  protected readonly formatDate = formatGermanDate;

  protected readonly users = resource({ loader: () => this.api.users() });
  protected readonly userToDelete = signal<AdminUser | null>(null);
  protected readonly deletingUser = signal(false);

  protected async deleteUser(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;
    this.deletingUser.set(true);
    try {
      await this.api.deleteUser(user.id);
      this.toasts.success(`${shownName(user)} wurde gelöscht.`);
      this.users.reload();
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
    } finally {
      this.deletingUser.set(false);
      this.userToDelete.set(null);
    }
  }
}
