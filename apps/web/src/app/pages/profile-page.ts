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
  type Score,
} from '@bszz-dojo/shared';
import { ShownNamePipe } from '../ui/shown-name.pipe';
import { RouterLink } from '@angular/router';
import { css } from 'styled-system/css';
import { iconButton } from 'styled-system/recipes';
import { AuthStore } from '../auth/auth.store';
import { errorMessage, isUnreachable } from '../core/error-message';
import { BadgesApiService } from '../core/badges-api.service';
import { ProfilesApiService } from '../core/profiles-api.service';
import { ToastStore, toastErrors } from '../layout/toast.store';
import { ScoresApiService } from '../core/scores-api.service';
import { FriendsStore } from '../friends/friends.store';
import { ProgressChart } from '../profile/progress-chart';
import { Icon } from '../ui/icon';
import { faUserGroup, faUserMinus, faUserPlus } from '../ui/icons';
import { withPendingProfile } from '../scores/pending-merge';
import { PendingScoresStore, reloadAfterUploads } from '../scores/pending-scores.store';
import { BadgeRow } from '../profile/badge-row';
import { ScoreRow } from '../profile/score-row';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { EmptyState } from '../ui/empty-state';
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
    ShownNamePipe,
    LoadingFrame,
    EmptyState,
    RouterLink,
    Icon,
  ],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  readonly username = input.required<string>();

  private readonly auth = inject(AuthStore);
  private readonly profiles = inject(ProfilesApiService);
  private readonly scores = inject(ScoresApiService);
  private readonly badges = inject(BadgesApiService);
  private readonly toasts = inject(ToastStore);

  protected readonly profile = resource({
    params: () => ({ username: this.username() }),
    loader: ({ params }) => this.profiles.get(params.username),
  });

  protected readonly isOwnProfile = computed(
    () => usernameKey(this.username()) === usernameKey(this.auth.username()),
  );
  private readonly pendingScores = inject(PendingScoresStore);
  protected readonly pendingIds = this.pendingScores.pendingIds;
  /** The own profile with the rounds saved or deleted offline */
  protected readonly shown = computed(() => {
    if (!this.profile.hasValue()) return null;
    const profile = this.profile.value();
    return this.isOwnProfile()
      ? withPendingProfile(profile, this.pendingScores.changes())
      : profile;
  });

  /** The first distance again whenever another profile is opened. */
  protected readonly recordsTab = linkedSignal(() => this.firstTab(this.shown()?.personalBests));
  protected readonly chartTab = linkedSignal(() => this.firstTab(this.shown()?.progress));

  protected readonly scoreToDelete = signal<string | null>(null);
  protected readonly badgeToDelete = signal<string | null>(null);
  protected readonly deleting = signal(false);

  protected readonly friends = inject(FriendsStore);
  protected readonly icons = { add: faUserPlus, remove: faUserMinus, friends: faUserGroup };
  protected readonly iconButton = iconButton();
  protected readonly pageStyles = {
    nameRow: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '15',
      marginBlockEnd: '5',
      '& h1': { marginBlockEnd: '0' },
    }),
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

  constructor() {
    toastErrors(() => this.profile.error());
    reloadAfterUploads(this.pendingScores, () => this.profile.reload());
  }

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
    const score = this.findShown(id);
    if (id === null || score === null) return;
    if (this.pendingIds().has(id) || this.auth.isOffline()) {
      this.pendingScores.deleteLater(score);
      this.scoreToDelete.set(null);
      return;
    }
    this.deleting.set(true);
    try {
      await this.scores.delete(id);
      // Records, chart and stats all change, so the whole profile is fetched again.
      this.profile.reload();
    } catch (error: unknown) {
      if (isUnreachable(error)) {
        this.auth.markOffline();
        this.pendingScores.deleteLater(score);
      } else this.toasts.error(errorMessage(error));
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
      this.profile.reload();
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
    } finally {
      this.deleting.set(false);
      this.badgeToDelete.set(null);
    }
  }

  private findShown(id: string | null): Score | null {
    const profile = this.shown();
    if (id === null || !profile) return null;
    return (
      profile.history.find((score) => score.id === id) ??
      profile.personalBests.flatMap((group) => group.scores).find((score) => score.id === id) ??
      null
    );
  }

  private firstTab(groups: readonly { distance: number }[] | undefined): string {
    return groups?.[0] ? String(groups[0].distance) : '';
  }
}
