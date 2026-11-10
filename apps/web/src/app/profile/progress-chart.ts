import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  BOW_TYPES,
  formatGermanDate,
  type BowTypeId,
  type DistanceProgress,
  type IsoDate,
} from '@bszz-dojo/shared';
import {
  CategoryScale,
  Chart,
  type ChartData,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { css } from 'styled-system/css';
import { chartColors } from '../core/chart-colors';
import { SettingsStore } from '../settings/settings.store';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
);

type ProgressChartData = ChartData<'line', (number | null)[], string>;

interface ProgressChartInput {
  data: ProgressChartData;
  days: IsoDate[];
  /** The bow types' lines come first; the datasets after them only hold a day's rounds. */
  lines: number;
}

/** "08.11.26": the tooltip has the long date, the axis needs room for many. */
function shortDate(day: IsoDate): string {
  const [year, month, date] = day.split('-');
  return `${date}.${month}.${year.slice(2)}`;
}

/** `rgb(…)` from `BOW_TYPES` at 35% opacity, for the lines of the other bow types */
function faded(color: string): string {
  return color.replace('rgb(', 'rgba(').replace(')', ', 0.35)');
}

function average(values: readonly number[]): number {
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

/**
 * One line per bow type over every day any of them was shot. The old chart labelled the x axis
 * with the first bow type's dates only, so the other lines were drawn against the wrong days.
 * A day with several rounds of a bow type: the line goes through their average and every round
 * is a point of its own on that day.
 */
function chartData(
  progress: DistanceProgress,
  emphasized: BowTypeId | null,
): ProgressChartInput {
  const days = [
    ...new Set(progress.series.flatMap((series) => series.points.map((point) => point.shotOn))),
  ].toSorted();
  // Only next to other lines: a single one stays as it is.
  const highlight =
    progress.series.length > 1 && progress.series.some((series) => series.bowType === emphasized);
  const perSeries = progress.series.map((series) => ({
    ...BOW_TYPES[series.bowType],
    chartColor:
      highlight && series.bowType !== emphasized
        ? faded(BOW_TYPES[series.bowType].chartColor)
        : BOW_TYPES[series.bowType].chartColor,
    strong: highlight && series.bowType === emphasized,
    results: days.map((day) =>
      series.points.filter((point) => point.shotOn === day).map((point) => point.result),
    ),
  }));

  const lines = perSeries.map(({ name, chartColor, strong, results }) => {
    const shared = results.map((ofDay) => ofDay.length > 1);
    return {
      label: name,
      data: results.map((ofDay) => (ofDay.length > 0 ? average(ofDay) : null)),
      borderWidth: strong ? 3 : 1,
      tension: 0.3,
      spanGaps: true,
      borderColor: chartColor,
      backgroundColor: chartColor,
      // An average is no round: no point and no tooltip of its own.
      pointRadius: shared.map((several) => (several ? 0 : 3)),
      pointHitRadius: shared.map((several) => (several ? 0 : 1)),
    };
  });
  const rounds = perSeries.flatMap(({ name, chartColor, results }) => {
    const most = Math.max(...results.map((ofDay) => (ofDay.length > 1 ? ofDay.length : 0)));
    return Array.from({ length: most }, (_, nth) => ({
      label: name,
      data: results.map((ofDay) => (ofDay.length > 1 ? (ofDay[nth] ?? null) : null)),
      showLine: false,
      borderColor: chartColor,
      backgroundColor: chartColor,
    }));
  });

  return {
    data: { labels: days.map((day) => formatGermanDate(day)), datasets: [...lines, ...rounds] },
    days,
    lines: lines.length,
  };
}

@Component({
  selector: 'app-progress-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostStyles' },
  template: `<canvas #canvas aria-label="Entwicklung der Resultate" role="img"></canvas>`,
})
export class ProgressChart {
  readonly progress = input.required<DistanceProgress>();
  /** The viewer's bow type, drawn stronger than the others */
  readonly emphasized = input<BowTypeId | null>(null);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly settings = inject(SettingsStore);
  protected readonly hostStyles = css({ display: 'block', borderColor: 'border.subtle' });
  private chart: Chart<'line', (number | null)[], string> | null = null;

  constructor() {
    afterRenderEffect(() => {
      const progress = this.progress();
      // Read so the chart is redrawn in the new text color when the theme changes.
      this.settings.theme();
      const colors = chartColors(this.host.nativeElement);
      const color = colors.text;
      const grid = { color: colors.grid };

      const { data, days, lines } = chartData(progress, this.emphasized());

      this.chart?.destroy();
      this.chart = new Chart<'line', (number | null)[], string>(this.canvas().nativeElement, {
        type: 'line',
        data,
        options: {
          color,
          scales: {
            x: {
              grid,
              border: grid,
              ticks: {
                color,
                maxRotation: 0,
                callback: (_value, index): string => shortDate(days[index]),
              },
            },
            y: { ticks: { color }, grid, border: grid },
          },
          plugins: {
            legend: {
              display: true,
              labels: { filter: (item): boolean => (item.datasetIndex ?? 0) < lines },
            },
            tooltip: { displayColors: true },
          },
        },
      });
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
