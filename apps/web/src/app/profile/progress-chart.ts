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
 */
type ProgressChartData = ChartData<'line', (number | null)[], string>;

interface ProgressChartInput {
  data: ProgressChartData;
  /** The day of each x position; several rounds on one day take one position each. */
  slots: IsoDate[];
}

/** "08.11.26": the tooltip has the long date, the axis needs room for many. */
function shortDate(day: IsoDate): string {
  const [year, month, date] = day.split('-');
  return `${date}.${month}.${year.slice(2)}`;
}

function chartData(progress: DistanceProgress): ProgressChartInput {
  const days = [
    ...new Set(progress.series.flatMap((series) => series.points.map((point) => point.shotOn))),
  ].toSorted();
  // Several rounds on one day: one x position each, in the order they were entered.
  const slots: string[] = [];
  for (const day of days) {
    const perDay = Math.max(
      ...progress.series.map(
        (series) => series.points.filter((point) => point.shotOn === day).length,
      ),
    );
    for (let index = 0; index < perDay; index++) slots.push(day);
  }

  const datasets = progress.series.map((series) => {
    const data: (number | null)[] = slots.map(() => null);
    const used = new Map<string, number>();
    for (const point of series.points) {
      const nth = used.get(point.shotOn) ?? 0;
      used.set(point.shotOn, nth + 1);
      const slot = slots.indexOf(point.shotOn) + nth;
      data[slot] = point.result;
    }
    const { name, chartColor } = BOW_TYPES[series.bowType];
    return {
      label: name,
      data,
      borderWidth: 1,
      tension: 0.3,
      spanGaps: true,
      borderColor: chartColor,
      backgroundColor: chartColor,
    };
  });
  return { data: { labels: slots.map((day) => formatGermanDate(day)), datasets }, slots };
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

      const { data, slots } = chartData(progress);

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
                // Every round gets its date, also the second one of a day, so it isn't taken for
                // a round on another day.
                callback: (_value, index): string => shortDate(slots[index]),
              },
            },
            y: { ticks: { color }, grid, border: grid },
          },
          plugins: {
            legend: { display: true },
            tooltip: { displayColors: true },
          },
        },
      });
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
