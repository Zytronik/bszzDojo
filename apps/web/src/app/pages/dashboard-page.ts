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
import { errorMessage } from '../core/error-message';
import { failure, type Feedback } from '../core/feedback';
import { RankingsApiService } from '../core/rankings-api.service';
import { LeaderboardList } from '../dashboard/leaderboard-list';
import { MedalList } from '../dashboard/medal-list';
import { FeedbackMessage } from '../ui/feedback-message';
import { SkeletonList } from '../ui/skeleton-list';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';
import { Tabs, type TabItem } from '../ui/tabs';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitle, Section, Tabs, LeaderboardList, MedalList, FeedbackMessage, SkeletonList],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  protected readonly auth = inject(AuthStore);
  private readonly api = inject(RankingsApiService);

  protected readonly rankings = resource({ loader: () => this.api.get() });

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

  protected readonly loadError = computed((): Feedback | null =>
    this.rankings.error() ? failure(errorMessage(this.rankings.error())) : null,
  );
}
