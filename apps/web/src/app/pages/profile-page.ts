import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
  type DuelRecord,
  type ProfileHistory,
  type RankedScore,
  type Score,
} from '@bszz-dojo/shared';
import { Router, RouterLink } from '@angular/router';
import { ShownNamePipe } from '../ui/shown-name.pipe';
import { css, cx } from 'styled-system/css';
import { button, iconButton } from 'styled-system/recipes';
import { AuthStore } from '../auth/auth.store';
import { errorMessage, isUnreachable } from '../core/error-message';
import { restoreScrollWhen } from '../core/restore-scroll';
import { BadgesApiService } from '../core/badges-api.service';
import { DuelsApiService } from '../core/duels-api.service';
import { DuelRow } from '../duels/duel-row';
import { ProfilesApiService } from '../core/profiles-api.service';
import { ToastStore, toastErrors } from '../layout/toast.store';
import { ScoresApiService } from '../core/scores-api.service';
import { FriendsStore } from '../friends/friends.store';
import { ProfileHistoryMemory } from '../profile/profile-history-memory';
import { ProgressChart } from '../profile/progress-chart';
import { Icon } from '../ui/icon';
import { faBolt, faHeart, faHeartOutline } from '../ui/icons';
import { withPendingProfile } from '../scores/pending-merge';
import { PendingScoresStore, reloadAfterUploads } from '../scores/pending-scores.store';
import { BadgeRow } from '../profile/badge-row';
import { ScoreRow } from '../profile/score-row';
import { FormButton } from '../forms/form-button';
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
    FormButton,
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
    DuelRow,
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

  private readonly duelsApi = inject(DuelsApiService);
  protected readonly duels = resource({
    params: () => ({ username: this.username() }),
    loader: ({ params }) => this.duelsApi.ofProfile(params.username),
  });
  protected readonly boltIcon = faBolt;
  protected readonly challengeStyles = cx(button(), css({ marginBlockStart: '15' }));

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

  private readonly historyMemory = inject(ProfileHistoryMemory);
  /** Back to this profile (browser back, or the header's back link from one of its rounds) */
  private readonly returning = inject(Router).currentNavigation()?.trigger === 'popstate';
  /**
   * Pages after the profile's own history, until another profile is opened. Coming back, the
   * ones loaded before, so the row the archer left from is there to scroll to.
   */
  private readonly older = linkedSignal({
    source: () => this.username(),
    computation: (username, previous): ProfileHistory | null =>
      previous === undefined && this.returning ? this.historyMemory.take(username) : null,
  });
  protected readonly loadingMore = signal(false);
  protected readonly hasMore = computed(() => {
    const older = this.older();
    if (older) return older.hasMore;
    const profile = this.profile.hasValue() ? this.profile.value() : null;
    return profile !== null && profile.stats.totalScores > profile.history.length;
  });
  /**
   * The merged history, then the server's rounds the rounds waiting for their upload pushed out of
   * it, then the older pages. Rounds can appear twice when new ones were uploaded meanwhile.
   */
  protected readonly history = computed((): Score[] => {
    const shown = this.shown();
    if (!shown || !this.profile.hasValue()) return [];
    const deleted = new Set(
      this.isOwnProfile() ? this.pendingScores.changes().deleted.map((score) => score.id) : [],
    );
    const rows = new Map<string, Score>();
    for (const score of [
      ...shown.history,
      ...this.profile.value().history,
      ...(this.older()?.scores ?? []),
    ]) {
      if (!deleted.has(score.id) && !rows.has(score.id)) rows.set(score.id, score);
    }
    return [...rows.values()];
  });

  protected readonly scoreToDelete = signal<string | null>(null);
  protected readonly badgeToDelete = signal<string | null>(null);
  protected readonly deleting = signal(false);

  protected readonly friends = inject(FriendsStore);
  protected readonly icons = { heart: faHeart, outline: faHeartOutline };
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
    duelFigures: css({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10',
      marginBlockEnd: '10',
    }),
    duelFigure: css({ layerStyle: 'surface', rounded: 'sm', p: '15', textAlign: 'center' }),
    duelNumber: css({ fontSize: '2xl', fontWeight: 'bold' }),
    duelWins: css({ fontSize: '2xl', fontWeight: 'bold', color: 'accent.default' }),
    duelCaption: css({ textStyle: 'body.small', layerStyle: 'muted' }),
    duelAgainst: css({ my: '10' }),
  };

  constructor() {
    toastErrors(() => this.profile.error());
    reloadAfterUploads(this.pendingScores, () => this.profile.reload());
    restoreScrollWhen(() => this.profile.hasValue());
    inject(DestroyRef).onDestroy(() => this.historyMemory.save(this.username(), this.older()));
  }

  protected winRate(record: DuelRecord): string {
    const played = record.wins + record.losses;
    return played === 0 ? '–' : `${Math.round((record.wins / played) * 100)}%`;
  }

  protected async loadMore(): Promise<void> {
    if (!this.profile.hasValue()) return;
    const username = this.username();
    const older = this.older();
    const offset = this.profile.value().history.length + (older?.scores.length ?? 0);
    this.loadingMore.set(true);
    try {
      const page = await this.profiles.history(username, offset);
      if (username !== this.username()) return;
      this.older.set({ scores: [...(older?.scores ?? []), ...page.scores], hasMore: page.hasMore });
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
    } finally {
      this.loadingMore.set(false);
    }
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
      const older = this.older();
      if (older) {
        this.older.set({ ...older, scores: older.scores.filter((row) => row.id !== id) });
      }
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
      this.history().find((score) => score.id === id) ??
      profile.personalBests.flatMap((group) => group.scores).find((score) => score.id === id) ??
      null
    );
  }

  private firstTab(groups: readonly { distance: number }[] | undefined): string {
    return groups?.[0] ? String(groups[0].distance) : '';
  }
}
