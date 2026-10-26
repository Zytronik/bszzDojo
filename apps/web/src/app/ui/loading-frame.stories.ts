import type { Meta, StoryObj } from '@storybook/angular-vite';
import { EmptyState } from './empty-state';
import { LoadingFrame } from './loading-frame';

const meta: Meta<LoadingFrame> = {
  title: 'Feedback/Loading Frame',
  component: LoadingFrame,
  args: { loading: true, lines: 2, rank: false, chart: false },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [EmptyState] },
    template: `
      <app-loading-frame [loading]="loading" [lines]="lines" [rank]="rank" [chart]="chart">
        @if (!loading) {
          <app-empty-state>Keine Rekorde vorhanden.</app-empty-state>
        }
      </app-loading-frame>
    `,
  }),
};
export default meta;

type Story = StoryObj<LoadingFrame>;

export const Loading: Story = {};
/** The skeleton stays invisible, so a short answer keeps its height. */
export const Loaded: Story = { args: { loading: false } };
export const Chart: Story = { args: { chart: true } };
