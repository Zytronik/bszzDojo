import { provideHttpClient } from '@angular/common/http';
import type { DistanceProgress } from '@bszz-dojo/shared';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { ProgressChart } from './progress-chart';

const progress: DistanceProgress = {
  distance: 18,
  series: [
    {
      bowType: 'r',
      points: [
        { shotOn: '2026-09-02', result: 231 },
        { shotOn: '2026-09-16', result: 244 },
        { shotOn: '2026-10-07', result: 252 },
        { shotOn: '2026-10-21', result: 263 },
      ],
    },
    {
      bowType: 'cp',
      points: [
        { shotOn: '2026-09-16', result: 268 },
        { shotOn: '2026-10-14', result: 275 },
      ],
    },
  ],
};

const meta: Meta<ProgressChart> = {
  title: 'Display/Progress Chart',
  component: ProgressChart,
  // The chart follows the theme from `SettingsStore`, which needs HTTP.
  decorators: [applicationConfig({ providers: [provideHttpClient()] })],
  args: { progress },
};
export default meta;

type Story = StoryObj<ProgressChart>;

/** One line per bow type, over every day any of them was shot */
export const TwoBowTypes: Story = {};
export const OneBowType: Story = {
  args: { progress: { ...progress, series: progress.series.slice(0, 1) } },
};
