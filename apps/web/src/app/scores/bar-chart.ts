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
import { css } from 'styled-system/css';
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

/**
 * Canvas can't read tokens: the host carries them (text `color`, grid `borderColor`, bars
 * `outlineColor`, set as `ringColor`) and the chart reads them back. Both tones up front for Panda.
 */
const HOST_STYLES: Record<BarTone, string> = {
  accent: css({
    display: 'block',
    aspectRatio: '2 / 1',
    borderColor: 'border.subtle',
    ringColor: 'accent.default',
  }),
  gold: css({
    display: 'block',
    aspectRatio: '2 / 1',
    borderColor: 'border.subtle',
    ringColor: 'medal.gold',
  }),
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
      const style = getComputedStyle(this.host.nativeElement);
      const grid = { color: style.borderTopColor };

      this.chart?.destroy();
      this.chart = new Chart<'bar' | 'line', number[], string>(this.canvas().nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { type: 'bar', data: values, backgroundColor: style.outlineColor, borderRadius: 3 },
            ...(average === null
              ? []
              : [
                  {
                    type: 'line' as const,
                    data: labels.map(() => average),
                    borderColor: style.color,
                    borderDash: [5, 4],
                    borderWidth: 1,
                    pointRadius: 0,
                  },
                ]),
          ],
        },
        options: {
          maintainAspectRatio: false,
          color: style.color,
          scales: {
            x: { ticks: { color: style.color }, grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { color: style.color, precision: 0 },
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
