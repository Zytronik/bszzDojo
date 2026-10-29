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
import { RouterLink } from '@angular/router';
import {
  APP_NAME,
  BOW_TYPES,
  endTotals,
  formatGermanDate,
  isInnerTen,
  ringDistribution,
  shotGroup,
  shotPoints,
  shownName,
  storedEndSize,
  targetLabel,
  type ScoreDetail,
  type Shot,
  type ShotGroup,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { split } from 'styled-system/recipes';
import { AuthStore } from '../auth/auth.store';
import { ScoresApiService } from '../core/scores-api.service';
import { ToastStore, toastErrors } from '../layout/toast.store';
import { BarChart } from '../scores/bar-chart';
import { PendingScoresStore } from '../scores/pending-scores.store';
import { GroupAnalysis } from '../scores/group-analysis';
import { ScoreSheet } from '../scores/score-sheet';
import { ScoreSummary } from '../scores/score-summary';
import { TargetCanvas } from '../scores/target-canvas';
import { EmptyState } from '../ui/empty-state';
import { Icon } from '../ui/icon';
import { faChevronLeft, faShareNodes } from '../ui/icons';
import { LoadingFrame } from '../ui/loading-frame';
import { Section } from '../ui/section';
import { Tabs, type TabItem } from '../ui/tabs';

const ALL_ENDS = 'all';

interface ScoreAnalysis {
  shots: Shot[];
  points: number[];
  inner: boolean[];
  perEnd: number;
  ends: TabItem[];
  group: ShotGroup | null;
  endLabels: string[];
  endTotals: number[];
  endAverage: number;
  ringLabels: string[];
  ringCounts: number[];
}
/**
 * Canvas colors (see `TargetCanvas`): the picked end as usual, the others faded; an arrow tapped on
 * the scorecard stays highlighted on top.
 */
const PICKED_END_COLOR = '#ffae00';
const OTHER_END_COLOR = 'rgba(0, 0, 0, 0.2)';

@Component({
  selector: 'app-score-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Icon,
    Section,
    LoadingFrame,
    EmptyState,
    Tabs,
    ScoreSummary,
    TargetCanvas,
    GroupAnalysis,
    BarChart,
    ScoreSheet,
  ],
  templateUrl: './score-page.html',
})
export class ScorePage {
  readonly id = input.required<string>();

  private readonly api = inject(ScoresApiService);
  private readonly toasts = inject(ToastStore);
  private readonly auth = inject(AuthStore);
  private readonly pendingScores = inject(PendingScoresStore);

  /**
   * A round saved offline is shown from the device until it's uploaded. It keeps its id on the
   * server, so once it leaves the queue the same page loads it from the API.
   */
  protected readonly pending = computed(
    () => this.pendingScores.myScores().find((score) => score.id === this.id()) ?? null,
  );

  protected readonly score = resource({
    params: () => ({ id: this.id(), pending: this.pending() }),
    loader: async ({ params }): Promise<ScoreDetail> => {
      const user = this.auth.user();
      if (params.pending && user) {
        return {
          ...params.pending,
          username: user.username,
          displayName: user.displayName,
          comparison: { rounds: 0, average: null, best: null },
        };
      }
      return this.api.get(params.id);
    },
  });
  protected readonly loaded = computed(() => (this.score.hasValue() ? this.score.value() : null));

  /** "Samstag, 24. Oktober 2026" without the weekday, so the title fits a phone's line. */
  protected readonly title = computed(() => {
    const score = this.loaded();
    return score ? (formatGermanDate(score.shotOn).split(', ')[1] ?? '') : 'Score';
  });
  protected readonly details = computed(() => {
    const score = this.loaded();
    if (!score) return '';
    return `${BOW_TYPES[score.bowType].name} · ${score.distance}m · ${targetLabel(score)}`;
  });
  protected readonly name = computed(() => {
    const score = this.loaded();
    return score ? shownName(score) : '';
  });

  protected readonly analysis = computed(() => {
    const score = this.loaded();
    return score?.shots ? this.analyse(score, score.shots) : null;
  });

  /** All ends, or one picked out on the target. Back to all when another round is opened. */
  protected readonly end = linkedSignal(() => {
    this.id();
    return ALL_ENDS;
  });
  /** The arrow tapped on the scorecard, highlighted on the target */
  protected readonly selected = signal<number | null>(null);
  protected readonly shotColors = computed(() => {
    const end = this.end();
    const analysis = this.analysis();
    if (end === ALL_ENDS || !analysis) return null;
    return analysis.points.map((_, index) =>
      Math.floor(index / analysis.perEnd) === Number(end) ? PICKED_END_COLOR : OTHER_END_COLOR,
    );
  });

  protected readonly icons = { back: faChevronLeft, share: faShareNodes };
  protected readonly styles = {
    heading: css({
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      gap: '15',
    }),
    // As tall as the title and the details next to it.
    side: css({
      display: 'flex',
      alignItems: 'center',
      flexShrink: '0',
      px: '15',
      layerStyle: 'surface',
      border: 'none',
      rounded: 'sm',
      color: 'inherit',
      cursor: 'pointer',
      transitionProperty: 'opacity',
      transitionDuration: 'normal',
      _hover: { opacity: 'muted' },
    }),
    titles: css({ flex: '1', textAlign: 'end' }),
    split: split(),
    legend: css({ textStyle: 'body.small', layerStyle: 'muted', marginBlockStart: '10' }),
    sheet: css({ maxW: 'canvas' }),
  };

  constructor() {
    toastErrors(() => this.score.error());
  }

  /** The phone's share sheet; where there's none (most desktop browsers), the link is copied. */
  protected async share(score: ScoreDetail): Promise<void> {
    const url = new URL(`/scores/${score.id}`, location.origin).href;
    const text = `${shownName(score)}: ${score.result} Punkte (${this.details()}), ${this.title()}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: APP_NAME, text, url });
      } catch {
        // Closed without sharing, or not allowed: nothing to tell.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      this.toasts.success('Link kopiert.');
    } catch {
      this.toasts.error('Der Link konnte nicht kopiert werden.');
    }
  }

  private analyse(score: ScoreDetail, shots: Shot[]): ScoreAnalysis {
    const points = shots.map((shot) => shotPoints(shot, score.isSpot, score.bowType));
    const perEnd = storedEndSize(score.distance, score.arrows);
    const totals = endTotals(points, perEnd);
    const ends: TabItem[] = [
      { id: ALL_ENDS, label: 'Alle' },
      ...totals.map((_, index) => ({ id: String(index), label: String(index + 1) })),
    ];
    const rings = ringDistribution(shots, score.isSpot, score.bowType);
    return {
      shots,
      points,
      inner: shots.map((shot) => isInnerTen(shot, score.isSpot)),
      perEnd,
      ends,
      group: shotGroup(shots),
      endLabels: totals.map((_, index) => String(index + 1)),
      endTotals: totals,
      endAverage: score.result / totals.length,
      ringLabels: rings.map((ring) => ring.label),
      ringCounts: rings.map((ring) => ring.count),
    };
  }
}
