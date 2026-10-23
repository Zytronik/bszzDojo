import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import {
  usernameKey,
  type DistanceProgress,
  type PersonalBests,
  type RankedScore,
} from '@bszz-dojo/shared';
import { ShownNamePipe } from '../ui/shown-name.pipe';
import { css } from 'styled-system/css';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { failure, type Feedback } from '../core/feedback';
import { BadgesApiService } from '../core/badges-api.service';
import { ProfilesApiService } from '../core/profiles-api.service';
import { ScoresApiService } from '../core/scores-api.service';
import { ProgressChart } from '../profile/progress-chart';
import { BadgeRow } from '../profile/badge-row';
import { ScoreRow } from '../profile/score-row';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { EmptyState } from '../ui/empty-state';
import { FeedbackMessage } from '../ui/feedback-message';
import { RankBadge } from '../ui/rank-badge';
import { Section } from '../ui/section';
import { LoadingFrame } from '../ui/loading-frame';
import { Tabs, type TabItem } from '../ui/tabs';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Section,
    Tabs,
    RankBadge,
    ScoreRow,
    BadgeRow,
    ProgressChart,
    ConfirmDialog,
    FeedbackMessage,
    ShownNamePipe,
    LoadingFrame,
    EmptyState,
  ],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  /** Route param */
  readonly username = input.required<string>();

  private readonly auth = inject(AuthStore);
  private readonly profiles = inject(ProfilesApiService);
  private readonly scores = inject(ScoresApiService);
  private readonly badges = inject(BadgesApiService);

  protected readonly profile = resource({
    params: () => ({ username: this.username() }),
    loader: ({ params }) => this.profiles.get(params.username),
  });

  protected readonly isOwnProfile = computed(
    () => usernameKey(this.username()) === usernameKey(this.auth.username()),
  );

  /** The first distance again whenever another profile is opened. */
  protected readonly recordsTab = linkedSignal(() =>
    this.firstTab(this.profile.value()?.personalBests),
  );
  protected readonly chartTab = linkedSignal(() => this.firstTab(this.profile.value()?.progress));

  protected readonly scoreToDelete = signal<string | null>(null);
  protected readonly badgeToDelete = signal<string | null>(null);
  protected readonly deleting = signal(false);
  private readonly deleteError = signal<string | null>(null);
  private readonly badgeDeleteError = signal<string | null>(null);

  protected readonly loadError = computed((): Feedback | null =>
    this.profile.error() ? failure(errorMessage(this.profile.error())) : null,
  );
  protected readonly badgeDeleteFeedback = computed((): Feedback | null => {
    const error = this.badgeDeleteError();
    return error ? failure(error) : null;
  });
  protected readonly deleteFeedback = computed((): Feedback | null => {
    const error = this.deleteError();
    return error ? failure(error) : null;
  });

  protected readonly pageStyles = {
    rankRow: css({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      '& > p': { me: '15' },
    }),
    stats: css({
      borderBlockStartWidth: 'thick',
      borderBlockStartStyle: 'solid',
      borderColor: 'border.subtle',
      marginBlockStart: '10',
      paddingBlockStart: '10',
    }),
    stat: css({ display: 'flex', gap: '15' }),
  };

  protected distanceTabs(groups: readonly { distance: number }[]): TabItem[] {
    return groups.map(({ distance }) => ({ id: String(distance), label: `${distance}m` }));
  }

  protected bestsFor(bests: readonly PersonalBests[]): RankedScore[] {
    return bests.find((group) => String(group.distance) === this.recordsTab())?.scores ?? [];
  }

  protected progressFor(progress: readonly DistanceProgress[]): DistanceProgress | null {
    return progress.find((group) => String(group.distance) === this.chartTab()) ?? null;
  }

  protected async deleteScore(): Promise<void> {
    const id = this.scoreToDelete();
    if (id === null) return;
    this.deleting.set(true);
    try {
      await this.scores.delete(id);
      this.deleteError.set(null);
      // Records, chart and stats all change, so the whole profile is fetched again.
      this.profile.reload();
    } catch (error: unknown) {
      this.deleteError.set(errorMessage(error));
    } finally {
      this.deleting.set(false);
      this.scoreToDelete.set(null);
    }
  }

  protected async deleteBadge(): Promise<void> {
    const id = this.badgeToDelete();
    if (id === null) return;
    this.deleting.set(true);
    try {
      await this.badges.delete(id);
      this.badgeDeleteError.set(null);
      this.profile.reload();
    } catch (error: unknown) {
      this.badgeDeleteError.set(errorMessage(error));
    } finally {
      this.deleting.set(false);
      this.badgeToDelete.set(null);
    }
  }

  private firstTab(groups: readonly { distance: number }[] | undefined): string {
    return groups?.[0] ? String(groups[0].distance) : '';
  }
}
