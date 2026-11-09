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

/**
 * One line per bow type over every day any of them was shot. The old chart labelled the x axis
 * with the first bow type's dates only, so the other lines were drawn against the wrong days.
 * A day with several rounds of a bow type: the line goes through their average and every round
 * is a point of its own on that day.
 */
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

function average(values: readonly number[]): number {
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function chartData(progress: DistanceProgress): ProgressChartInput {
  const days = [
    ...new Set(progress.series.flatMap((series) => series.points.map((point) => point.shotOn))),
  ].toSorted();
  const perSeries = progress.series.map((series) => ({
    ...BOW_TYPES[series.bowType],
    results: days.map((day) =>
      series.points.filter((point) => point.shotOn === day).map((point) => point.result),
    ),
  }));

  const lines = perSeries.map(({ name, chartColor, results }) => {
    const shared = results.map((ofDay) => ofDay.length > 1);
    return {
      label: name,
      data: results.map((ofDay) => (ofDay.length > 0 ? average(ofDay) : null)),
      borderWidth: 1,
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

      const { data, days, lines } = chartData(progress);

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
