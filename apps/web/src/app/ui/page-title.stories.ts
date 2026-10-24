import type { Meta, StoryObj } from '@storybook/angular-vite';
import { PageTitle } from './page-title';

const meta: Meta<PageTitle> = {
  title: 'Layout/Page Title',
  component: PageTitle,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Score erfassen',
    titleSecondLine: '',
    description: 'Trage hier deine Leistungen im BSZZ Dojo ein.',
  },
};
export default meta;

type Story = StoryObj<PageTitle>;

export const Default: Story = {};
export const TwoLines: Story = {
  args: {
    title: 'Willkommen im',
    titleSecondLine: 'BSZZ Dojo',
    description: 'Bitte logge dich ein oder registriere dich, um das BSZZ Dojo zu betreten.',
  },
};
