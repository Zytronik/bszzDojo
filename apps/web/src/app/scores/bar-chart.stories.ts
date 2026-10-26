import { provideHttpClient } from '@angular/common/http';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { BarChart } from './bar-chart';

const meta: Meta<BarChart> = {
  title: 'Scores/Bar Chart',
  component: BarChart,
  // The chart follows the theme from `SettingsStore`, which needs HTTP.
  decorators: [applicationConfig({ providers: [provideHttpClient()] })],
  args: {
    label: 'Passensummen',
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    values: [25, 24, 27, 28, 26, 28, 27, 23, 25, 23],
    average: 25.6,
  },
};
export default meta;

type Story = StoryObj<BarChart>;

/** Totals per end with their average */
export const Ends: Story = {};
export const RingDistribution: Story = {
  args: {
    label: 'Ringverteilung',
    labels: ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'],
    values: [2, 4, 15, 3, 3, 2, 0, 1, 0, 0, 0, 0],
    average: null,
    tone: 'gold',
  },
};
