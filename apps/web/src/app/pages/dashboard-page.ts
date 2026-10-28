import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { LEADERBOARD_DISTANCES, MONTH_NAMES, type DistanceLeaderboard } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { AuthStore } from '../auth/auth.store';
import { RankingsApiService } from '../core/rankings-api.service';
import { LeaderboardList } from '../dashboard/leaderboard-list';
import { withPendingRankings } from '../scores/pending-merge';
import { PendingScoresStore, reloadAfterUploads } from '../scores/pending-scores.store';
import { MedalList } from '../dashboard/medal-list';
import { toastErrors } from '../layout/toast.store';
import { LoadingFrame } from '../ui/loading-frame';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';
import { Tabs, type TabItem } from '../ui/tabs';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitle, Section, Tabs, LeaderboardList, MedalList, LoadingFrame],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  protected readonly auth = inject(AuthStore);
  private readonly api = inject(RankingsApiService);

  private readonly pendingScores = inject(PendingScoresStore);
  protected readonly rankings = resource({ loader: () => this.api.get() });
  /** With the user's rounds still waiting for the sync */
  protected readonly shown = computed(() =>
    this.rankings.hasValue()
      ? withPendingRankings(this.rankings.value(), this.pendingScores.changes(), this.auth.user())
      : null,
  );
  protected readonly loading = computed(
    () => !this.rankings.hasValue() && this.rankings.isLoading(),
  );

  protected readonly distanceTabs: TabItem[] = LEADERBOARD_DISTANCES.map((distance) => ({
    id: String(distance),
    label: `${distance}m`,
  }));
  protected readonly allTimeTab = signal(this.distanceTabs[0]?.id ?? '');
  protected readonly monthlyTab = signal(this.distanceTabs[0]?.id ?? '');

  protected readonly leadStyles = css({ marginBlockEnd: '10' });

  protected monthName(month: number): string {
    return MONTH_NAMES[month - 1] ?? '';
  }

  protected entries(
    boards: readonly DistanceLeaderboard[],
    tab: string,
  ): DistanceLeaderboard['entries'] {
    return boards.find((board) => String(board.distance) === tab)?.entries ?? [];
  }

  constructor() {
    toastErrors(() => this.rankings.error());
    reloadAfterUploads(this.pendingScores, () => this.rankings.reload());
  }
}
