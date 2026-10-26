import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { css, cx } from 'styled-system/css';
import { chartColors } from '../core/chart-colors';
import { SettingsStore } from '../settings/settings.store';

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
);

type BarTone = 'accent' | 'gold';

const hostBase = css({ display: 'block', aspectRatio: '2 / 1', borderColor: 'border.subtle' });

/** The colors for `chartColors`, both tones up front for Panda. */
const HOST_STYLES: Record<BarTone, string> = {
  accent: cx(hostBase, css({ ringColor: 'accent.default' })),
  gold: cx(hostBase, css({ ringColor: 'medal.gold' })),
};

/** One bar per label, with an optional dashed `average` line across. */
@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostStyles()' },
  template: `<canvas #canvas role="img" [attr.aria-label]="label()"></canvas>`,
})
export class BarChart {
  readonly labels = input.required<readonly string[]>();
  readonly values = input.required<readonly number[]>();
  readonly average = input<number | null>(null);
  readonly tone = input<BarTone>('accent');
  /** For screen readers */
  readonly label = input.required<string>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly settings = inject(SettingsStore);
  private chart: Chart<'bar' | 'line', number[], string> | null = null;
  protected readonly hostStyles = computed(() => HOST_STYLES[this.tone()]);

  constructor() {
    afterRenderEffect(() => {
      const labels = [...this.labels()];
      const values = [...this.values()];
      const average = this.average();
      this.hostStyles();
      // Read so the chart is redrawn in the new colors when the theme changes.
      this.settings.theme();
      const colors = chartColors(this.host.nativeElement);
      const grid = { color: colors.grid };

      this.chart?.destroy();
      this.chart = new Chart<'bar' | 'line', number[], string>(this.canvas().nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { type: 'bar', data: values, backgroundColor: colors.data, borderRadius: 3 },
            ...(average === null
              ? []
              : [
                  {
                    type: 'line' as const,
                    data: labels.map(() => average),
                    borderColor: colors.text,
                    borderDash: [5, 4],
                    borderWidth: 1,
                    pointRadius: 0,
                  },
                ]),
          ],
        },
        options: {
          maintainAspectRatio: false,
          color: colors.text,
          scales: {
            x: { ticks: { color: colors.text }, grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { color: colors.text, precision: 0 },
              grid,
              border: grid,
            },
          },
          plugins: { legend: { display: false } },
        },
      });
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
