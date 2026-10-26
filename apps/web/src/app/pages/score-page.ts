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
import { ScoresApiService } from '../core/scores-api.service';
import { toastErrors } from '../layout/toast.store';
import { BarChart } from '../scores/bar-chart';
import { GroupAnalysis } from '../scores/group-analysis';
import { ScoreSheet } from '../scores/score-sheet';
import { ScoreSummary } from '../scores/score-summary';
import { TargetCanvas } from '../scores/target-canvas';
import { EmptyState } from '../ui/empty-state';
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

  protected readonly score = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => this.api.get(params.id),
  });
  protected readonly loaded = computed(() => (this.score.hasValue() ? this.score.value() : null));

  protected readonly title = computed(() => {
    const score = this.loaded();
    return score ? `Score vom ${formatGermanDate(score.shotOn)}` : 'Score';
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

  protected readonly styles = {
    back: css({ display: 'inline-block', marginBlockEnd: '10' }),
    split: css({
      display: 'flex',
      flexDir: 'column',
      gap: '25',
      md: { display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'start' },
    }),
    legend: css({ textStyle: 'body.small', layerStyle: 'muted', marginBlockStart: '10' }),
    sheet: css({ maxW: 'canvas' }),
  };

  constructor() {
    toastErrors(() => this.score.error());
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
