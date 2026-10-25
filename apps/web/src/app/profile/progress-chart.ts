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
import { BOW_TYPES, formatGermanDate, type DistanceProgress } from '@bszz-dojo/shared';
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

function chartData(progress: DistanceProgress): ProgressChartData {
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
  return { labels: slots.map((day) => formatGermanDate(day)), datasets };
}

@Component({
  selector: 'app-progress-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Canvas can't read tokens: the host carries the colors and the chart reads them back.
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
      const style = getComputedStyle(this.host.nativeElement);
      const color = style.color;
      // Chart.js draws its grid in translucent black, which disappears on the dark theme.
      const grid = { color: style.borderTopColor };

      this.chart?.destroy();
      this.chart = new Chart<'line', (number | null)[], string>(this.canvas().nativeElement, {
        type: 'line',
        data: chartData(progress),
        options: {
          color,
          scales: {
            x: { display: false },
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
