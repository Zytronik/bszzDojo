/**
 * Canvas can't read tokens: a chart's host element carries them as CSS (text `color`, grid
 * `borderColor`, data `ringColor`) and the chart reads them back. Chart.js's own grid is
 * translucent black, which disappears on the dark theme.
 */
export interface ChartColors {
  text: string;
  grid: string;
  data: string;
}

export function chartColors(host: HTMLElement): ChartColors {
  const style = getComputedStyle(host);
  return { text: style.color, grid: style.borderTopColor, data: style.outlineColor };
}
